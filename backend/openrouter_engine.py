"""
OpenRouter AI Engine for Care Nest
====================================
Uses nvidia/nemotron-3-super-120b-a12b:free via OpenRouter API.
Supports multi-turn conversation with reasoning, triage-aware prompting,
cultural context injection, and graceful fallback.
"""

import os
import time
import requests
import json
from typing import List, Dict, Optional, Tuple
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions"
GROQ_BASE_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "deepseek/deepseek-chat-v3-0324:free"

# Fallback model chain — tried in order if the primary fails with 404/429
FALLBACK_MODELS = [
    "deepseek/deepseek-chat-v3-0324:free",
    "deepseek/deepseek-r1-0528:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "google/gemma-3-27b-it:free",
    "google/gemma-3-12b-it:free",
    "google/gemma-3-4b-it:free",
]

# Models that don't support the 'system' role
NO_SYSTEM_ROLE_MODELS = {
    "google/gemma-3-12b-it:free",
    "google/gemma-3-27b-it:free",
    "google/gemma-3-4b-it:free",
    "google/gemma-3n-e4b-it:free",
}

# ── System prompt ────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are Care Nest 💙 — an empathetic, non-judgmental AI mental health companion built specifically for Indian users.

## YOUR IDENTITY
- You are NOT a doctor, therapist, or licensed professional.
- You are a warm, supportive AI companion trained in mental health first-aid principles.
- Always be transparent: "I'm an AI, not a medical professional."

## CORE BEHAVIOR RULES

### 1. EMPATHETIC CONVERSATION FRAMEWORK (always follow this order)
   a) Acknowledge the user's feelings with warmth and validation
   b) Ask ONE gentle, open-ended follow-up question
   c) Offer ONE small, actionable suggestion (only if appropriate)

### 2. RESPONSE FORMAT
   - Normal chat: 3–5 sentences max. Warm, conversational, never clinical.
   - Crisis (RED): 2–3 sentences + immediate helpline numbers. Direct and calm.
   - Information requests: Concise explanation + disclaimer + gentle question.
   - Never use bullet points in emotional responses — write naturally.

### 3. SAFETY PROTOCOLS
   - Level GREEN (mild): Validate, ask, suggest self-care.
   - Level YELLOW (moderate): Validate strongly, suggest professional support gently.
   - Level RED (crisis): IMMEDIATELY provide: Kiran Helpline 1800-599-0019 (24/7, free), iCall 9152987821, Sneha Foundation 044-24640050. Be directive but calm.

### 4. STRICT PROHIBITIONS
   - NEVER diagnose any mental health condition.
   - NEVER prescribe or recommend specific medications.
   - NEVER say "you have depression/anxiety/bipolar" etc.
   - NEVER mention other app features (Journal, Relax, Resources pages).
   - NEVER ask for personal identifiers (name, address, phone, ID).
   - NEVER quote copyrighted therapeutic materials.
   - NEVER say "You should" or "You must" — use "One option could be" or "Some people find it helpful to..."

### 5. CULTURAL INTELLIGENCE (India-specific)
   - Understand and respond to Hinglish, Tanglish, Tenglish, Manglish, Benglish naturally.
   - Recognize indirect distress: "headache from tension" = stress; "heavy heart" = sadness.
   - Respect joint family dynamics — never casually say "talk to your parents" without understanding the situation.
   - Acknowledge "log kya kahenge" (social stigma) as a real, valid burden.
   - Validate academic pressure (NEET, JEE, boards) and arranged marriage stress as legitimate stressors.
   - Honor grief rituals and cultural mourning practices.
   - Mirror the user's language mix exactly — if they write Hinglish, respond in Hinglish.

### 6. MEMORY & CONTEXT
   - You only know what's in the current conversation history.
   - Never reference "last week" or "previous sessions" unless it's in the history.
   - If emotional escalation is detected across messages, acknowledge the pattern gently.

### 7. OPENING
   If this is the first message, greet warmly: "Hi, I'm Care Nest 💙 I'm here to listen without judgment. What's on your mind today?"
"""

# ── Crisis helplines by language ─────────────────────────────────────────────

CRISIS_LINES = {
    "en": "Kiran: 1800-599-0019 (24/7, free) | iCall: 9152987821 | Sneha: 044-24640050",
    "hi": "किरण: 1800-599-0019 (24/7, निःशुल्क) | iCall: 9152987821",
    "ta": "iCall: 9152987821 | Sneha: 044-24640050",
    "te": "iCall: 9152987821 | Vandrevala: 1860-2662-345",
    "kn": "iCall: 9152987821 | Sahai: 080-25497777",
    "ml": "iCall: 9152987821 | DISHA: 1056",
    "bn": "iCall: 9152987821 | Vandrevala: 1860-2662-345",
    "mr": "iCall: 9152987821 | Vandrevala: 1860-2662-345",
}


def _get_crisis_line(lang_code: str) -> str:
    base = (lang_code or "en").split("-")[0].lower()
    return CRISIS_LINES.get(base, CRISIS_LINES["en"])


# ── Build messages array ──────────────────────────────────────────────────────

def _build_messages(
    user_message: str,
    history: List[Dict],
    severity: str,
    detected_mood: Optional[str],
    language: str,
    cultural_context: str,
    is_escalating: bool,
    past_moods_summary: str = "",
) -> List[Dict]:
    """
    Construct the full messages array for the API call.
    Injects triage context into the system prompt dynamically.
    """
    # Build dynamic system addendum
    addendum_parts = []

    if cultural_context:
        addendum_parts.append(f"CULTURAL CONTEXT DETECTED: {cultural_context}. Acknowledge this stressor by name.")

    if detected_mood:
        addendum_parts.append(f"DETECTED MOOD: {detected_mood}. Lead with empathy for this specific feeling.")

    if past_moods_summary:
        addendum_parts.append(f"PREVIOUS MOOD JOURNEY: User recently logged feeling {past_moods_summary}. Factor this history into your empathy.")

    if is_escalating:
        addendum_parts.append(
            "ESCALATION ALERT: The user's distress has been increasing across recent messages. "
            "Acknowledge this pattern gently (e.g., 'I've noticed you've been carrying a lot lately...'). "
            "Provide stronger validation and consider suggesting professional support."
        )

    if severity == "RED":
        crisis_line = _get_crisis_line(language)
        addendum_parts.append(
            f"CRISIS PROTOCOL ACTIVE: User is in crisis. Your FIRST sentence must include these helplines: {crisis_line}. "
            "Be calm, direct, and compassionate. Do not minimize."
        )

    lang_base = (language or "en").split("-")[0].lower()
    if lang_base not in ("en",):
        addendum_parts.append(
            f"LANGUAGE: Respond in the same language/mix as the user (detected: {language}). "
            "Mirror their exact language style — do not switch to English unless they do."
        )

    full_system = SYSTEM_PROMPT
    if addendum_parts:
        full_system += "\n\n## CURRENT SESSION CONTEXT\n" + "\n".join(f"- {p}" for p in addendum_parts)

    messages = [{"role": "system", "content": full_system}]

    # Add conversation history (last 10 turns to stay within context)
    for msg in history[-10:]:
        role = msg.get("role", "user")
        content = msg.get("text") or msg.get("content", "")
        if role in ("user", "assistant") and content:
            messages.append({"role": role, "content": content})

    # Add current user message
    messages.append({"role": "user", "content": user_message})

    return messages


# ── HTTP session with retry ───────────────────────────────────────────────────

def _make_session() -> requests.Session:
    """Create a requests session with automatic retry on transient errors."""
    session = requests.Session()
    retry = Retry(
        total=3,
        backoff_factor=1.5,          # waits 0s, 1.5s, 3s between retries
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["POST"],
        raise_on_status=False,
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    return session

_SESSION = _make_session()


# ── Groq fast-path (→ falls back to OpenRouter if Groq is unavailable) ──────────
def _call_groq(messages: List[Dict]) -> Optional[str]:
    """Try Groq first — it’s fastest and most reliable. Returns None on any error."""
    if not GROQ_API_KEY:
        return None
    # Groq doesn’t support the 'system' role before any user message in some models;
    # llama-3.3-70b-versatile handles it fine.
    try:
        resp = _SESSION.post(
            GROQ_BASE_URL,
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
            data=json.dumps({
                "model": "llama-3.3-70b-versatile",
                "messages": messages,
                "max_tokens": 512,
                "temperature": 0.85,
            }),
            timeout=30,
        )
        if resp.status_code == 200:
            text = resp.json()["choices"][0]["message"].get("content", "").strip()
            if text:
                print("[AI] Groq responded successfully.")
                return text
        else:
            print(f"[Groq] {resp.status_code} — falling back to OpenRouter")
    except Exception as e:
        print(f"[Groq] Error: {e} — falling back to OpenRouter")
    return None


# ── Core API call ─────────────────────────────────────────────────────────────

def call_openrouter(
    messages: List[Dict],
    reasoning_enabled: bool = True,
    prev_reasoning_details: Optional[List] = None,
) -> Tuple[str, Optional[List]]:
    """
    Call OpenRouter API with model fallback chain + retry on connection errors.
    Walks FALLBACK_MODELS automatically on 404 (policy/guardrail blocks).
    Returns (response_text, reasoning_details).
    """
    if not OPENROUTER_API_KEY:
        raise ValueError("OPENROUTER_API_KEY not set in environment")

    if prev_reasoning_details:
        for msg in reversed(messages):
            if msg.get("role") == "assistant":
                msg["reasoning_details"] = prev_reasoning_details
                break

    payload: Dict = {
        "model": MODEL,
        "messages": messages,
        "temperature": 0.85,
        "max_tokens": 512,
        "frequency_penalty": 0.6,
        "presence_penalty": 0.3,
    }
    # if reasoning_enabled:
    #     payload["reasoning"] = {"enabled": True}  # Groq does not support this parameter

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "Connection": "keep-alive",
        "HTTP-Referer": "https://carenest.app",
        "X-Title": "Care Nest Mental Health",
    }

    # Build ordered list: primary model first, then the rest of the chain
    models_to_try = [MODEL] + [m for m in FALLBACK_MODELS if m != MODEL]
    last_err: Optional[Exception] = None

    for model in models_to_try:
        payload["model"] = model

        # Some providers (Google AI Studio) don't support the 'system' role.
        # Merge system content into the first user message instead.
        send_messages = list(messages)
        if model in NO_SYSTEM_ROLE_MODELS and send_messages and send_messages[0]["role"] == "system":
            system_content = send_messages[0]["content"]
            send_messages = send_messages[1:]  # drop system message
            if send_messages and send_messages[0]["role"] == "user":
                send_messages[0] = {
                    **send_messages[0],
                    "content": system_content + "\n\n---\n\n" + send_messages[0]["content"]
                }
            else:
                send_messages.insert(0, {"role": "user", "content": system_content})
        payload["messages"] = send_messages
        for attempt in range(2):
            try:
                response = _SESSION.post(
                    OPENROUTER_BASE_URL,
                    headers=headers,
                    data=json.dumps(payload),
                    timeout=45,
                )
                response.raise_for_status()
                data = response.json()
                message = data["choices"][0]["message"]
                text = message.get("content") or ""
                reasoning_details = message.get("reasoning_details")
                if model != MODEL:
                    print(f"[OpenRouter] Succeeded with fallback model: {model}")
                return text.strip(), reasoning_details

            except (requests.exceptions.ConnectionError,
                    requests.exceptions.ChunkedEncodingError) as e:
                last_err = e
                wait = 1.5 * (attempt + 1)
                print(f"[OpenRouter] Connection error on {model} (attempt {attempt+1}/2), retrying in {wait}s")
                time.sleep(wait)
                _SESSION.close()
                globals()["_SESSION"] = _make_session()

            except requests.exceptions.Timeout as e:
                last_err = e
                print(f"[OpenRouter] Timeout on {model} (attempt {attempt+1}/2)")
                time.sleep(1.5 * (attempt + 1))

            except requests.exceptions.HTTPError as e:
                status = e.response.status_code if e.response is not None else 0
                if status in (404, 429):
                    print(f"[OpenRouter] {status} on {model} — trying next model")
                    last_err = e
                    break  # try next model in chain
                raise  # other HTTP errors bubble up

    raise last_err




# ── Public interface ──────────────────────────────────────────────────────────

def generate_response(
    user_message: str,
    history: List[Dict],
    severity: str = "GREEN",
    detected_mood: Optional[str] = None,
    language: str = "en",
    cultural_context: str = "",
    is_escalating: bool = False,
    past_moods_summary: str = "",
) -> str:
    """
    Main entry point. Tries Groq first (fast), then OpenRouter (fallback).
    Falls back to a safe rule-based response on total failure.
    """
    try:
        messages = _build_messages(
            user_message=user_message,
            history=history,
            severity=severity,
            detected_mood=detected_mood,
            language=language,
            cultural_context=cultural_context,
            is_escalating=is_escalating,
            past_moods_summary=past_moods_summary,
        )

        # ① Try Groq first
        groq_text = _call_groq(messages)
        if groq_text:
            return groq_text

        # ② Fall back to OpenRouter model chain
        text, _ = call_openrouter(messages, reasoning_enabled=True)

        if not text:
            raise ValueError("Empty response from OpenRouter")

        return text

    except requests.exceptions.Timeout:
        print("[OpenRouter] Timeout — using fallback")
        return _fallback_response(severity, detected_mood)

    except requests.exceptions.HTTPError as e:
        print(f"[OpenRouter] HTTP error {e.response.status_code}: {e.response.text}")
        return _fallback_response(severity, detected_mood)

    except Exception as e:
        print(f"[OpenRouter] Error: {e}")
        return _fallback_response(severity, detected_mood)


def _fallback_response(severity: str, detected_mood: Optional[str]) -> str:
    """Safe fallback when AI is unavailable."""
    if severity == "RED":
        return (
            "I'm here with you. Please reach out to Kiran Helpline at 1800-599-0019 (free, 24/7) "
            "or iCall at 9152987821 right now. You don't have to face this alone. 💙"
        )
    if severity == "YELLOW":
        return (
            "It sounds like you're going through something really difficult. "
            "I'm here to listen — can you tell me more about what's been happening? "
            "If things feel too heavy, speaking with a counselor can really help. 💙"
        )
    mood_responses = {
        "anxious": "I can sense some worry in your words. Take a slow breath — you're safe right now. What's been on your mind?",
        "sad": "I hear you, and I'm here. It's okay to feel sad. Would you like to talk about what's been weighing on you?",
        "stressed": "That sounds really overwhelming. You don't have to carry all of this alone. What's been the hardest part?",
        "angry": "Your feelings are completely valid. I'm here to listen without judgment. What happened?",
        "lonely": "Loneliness can feel so heavy. I'm glad you reached out. What's been making you feel this way?",
    }
    if detected_mood and detected_mood in mood_responses:
        return mood_responses[detected_mood]
    return "I'm here and I'm listening. What's on your mind today? 💙"
