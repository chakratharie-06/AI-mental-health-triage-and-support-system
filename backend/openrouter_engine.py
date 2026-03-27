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

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "z-ai/glm-4.5-air:free"

# Fallback model chain — tried in order if the primary fails with 404
FALLBACK_MODELS = [
    "z-ai/glm-4.5-air:free",
    "qwen/qwen3-next-80b-a3b-instruct:free",
    "openai/gpt-oss-120b:free",
    "openai/gpt-oss-20b:free",
    "nvidia/nemotron-3-super-120b-a12b:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "mistralai/mistral-7b-instruct:free",
]

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
        "temperature": 0.7,
        "max_tokens": 512,
    }
    if reasoning_enabled:
        payload["reasoning"] = {"enabled": True}

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
                if status == 404:
                    print(f"[OpenRouter] 404 on {model} (guardrail/policy block) — trying next model")
                    last_err = e
                    break  # skip remaining attempts for this model, try next
                raise  # non-404 HTTP errors bubble up immediately

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
) -> str:
    """
    Main entry point. Generates an AI response using OpenRouter.
    Falls back to a safe rule-based response on any error.
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
        )

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
