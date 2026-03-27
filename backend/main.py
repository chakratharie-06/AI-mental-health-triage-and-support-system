import os
import time
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from langdetect import detect

# Existing Flask app and models
from app import app as flask_app
from models import db, User, Conversation, MoodEntry
from triage_engine import triage_engine
from auth import decode_token

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gemini Setup
try:
    from google import genai as google_genai
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    if GEMINI_API_KEY:
        gemini_client = google_genai.Client(api_key=GEMINI_API_KEY)
        GEMINI_MODEL = 'gemini-2.0-flash'
        USE_AI = True
    else:
        USE_AI = False
except ImportError:
    USE_AI = False

SYSTEM_PROMPT = """
You are Care Nest, an empathetic, non-judgmental AI mental health assistant.
Your dual role is to provide Emotional Support AND Accurate Mental Health Information.

🚨 CRITICAL RULE: YOU MUST NEVER ACT LIKE A DOCTOR OR MEDICAL PROFESSIONAL.
- NEVER diagnose mental health conditions.
- NEVER prescribe medication, treatment, or specific therapy programs.
- ALWAYS state clearly that you are an AI assistant and not a medical professional.
- Focus strictly on emotional support, grounding techniques, validation, and general information.
- Keep responses concise (2-4 sentences max).
- ALWAYS follow this Empathetic Conversation Framework: 1. Acknowledge the user's feelings. 2. Ask a gentle follow-up question. 3. Provide a small actionable suggestion.
- If severity is RED, mention Kiran Helpline (1800-599-0019), Sneha Foundation (044-24640050), or iCall (9152987821) immediately.
- NO cross-page context leakage. NEVER mention other app features.
"""

class ChatRequest(BaseModel):
    message: str
    language: Optional[str] = "en"
    distressLevel: Optional[str] = "none"
    culturalContext: Optional[str] = ""
    systemPrompt: Optional[str] = ""
    conversationHistory: Optional[List[Dict[str, Any]]] = []

@app.post("/api/chat")
async def chat_endpoint(request: Request, body: ChatRequest):
    auth_header = request.headers.get("Authorization")
    user_id = None
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        user_id = decode_token(token)
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    user_message = body.message
    
    # Use langdetect
    try:
        detected_lang_code = detect(user_message)
    except:
        detected_lang_code = "en"
        
    target_lang = body.language if body.language else detected_lang_code
        
    with flask_app.app_context():
        # Get or create conversation
        conversation = Conversation.query.filter_by(user_id=user_id).order_by(Conversation.updated_at.desc()).first()
        if not conversation:
            conversation = Conversation(user_id=user_id)
            conversation.set_messages([])
            db.session.add(conversation)
            
        conversation.add_message('user', user_message)
        
        # Triage
        emojis = triage_engine.extract_emojis(user_message)
        emoji_context = ''.join(emojis) if emojis else None
        
        severity, reason, intensity = triage_engine.analyze_severity(user_message, emoji_context)
        
        if intensity <= 2: distress_level = 0
        elif intensity <= 4: distress_level = 1
        elif intensity <= 6: distress_level = 2
        elif intensity <= 8: distress_level = 3
        else: distress_level = 4
            
        detected_mood, mood_confidence, mood_reason = triage_engine.detect_mood(user_message, emoji_context)
        
        if detected_mood and mood_confidence > 30:
            try:
                mood_entry = MoodEntry(user_id=user_id, mood=detected_mood, intensity=intensity)
                db.session.add(mood_entry)
            except:
                pass

        # Generate AI response
        ai_response = await generate_fastapi_response(
            user_message, severity, intensity, 
            body.conversationHistory, target_lang, detected_mood, body.culturalContext
        )
        
        conversation.add_message('ai', ai_response, severity, distress_level)
        db.session.commit()
        
        return {
            "response": ai_response,
            "triage_status": severity,
            "distress_level": distress_level,
            "intensity": intensity,
            "detected_emojis": emojis,
            "detected_mood": detected_mood,
            "mood_confidence": mood_confidence,
            "timestamp": time.time(),
            "detected_language": detected_lang_code
        }

async def generate_fastapi_response(user_message, severity, intensity, history, target_lang, detected_mood, cultural_context):
    if not USE_AI:
        return triage_engine.generate_rule_based_response(user_message, severity, history, detected_mood)
        
    full_prompt = [f"SYSTEM INSTRUCTION: {SYSTEM_PROMPT}"]
    
    # --- EMOTIONAL DIGITAL TWIN SYSTEM: Timeline Tracking ---
    timeline_context = ""
    recent_user_msgs = [msg.get("content", "") for msg in history if msg.get("role") == "user"][-3:]
    if len(recent_user_msgs) >= 2:
        hist_moods = []
        hist_intensities = []
        for text in recent_user_msgs:
            _, _, hist_intensity = triage_engine.analyze_severity(text)
            hist_mood, _, _ = triage_engine.detect_mood(text)
            hist_intensities.append(hist_intensity)
            if hist_mood and hist_mood not in hist_moods: 
                hist_moods.append(hist_mood)
        
        hist_intensities.append(intensity) # Add current
        if detected_mood and detected_mood not in hist_moods:
            hist_moods.append(detected_mood)

        # Check if intensity is strictly increasing or consistently high
        is_escalating = len(hist_intensities) >= 3 and (hist_intensities[-1] > hist_intensities[-2] >= hist_intensities[-3] or all(i >= 6 for i in hist_intensities[-3:]))
        
        if is_escalating:
            if severity != "RED":
                severity = "RED" # Auto-escalate support
                intensity = max(intensity, 8)
            
            if len(hist_moods) >= 2:
                mood_flow = " -> ".join(hist_moods)
            else:
                mood_flow = f"persistent {hist_moods[0] if hist_moods else 'distress'}"
                
            timeline_context = f"\nEMOTIONAL DIGITAL TWIN PATTERN: The user's emotional state has progressed ({mood_flow}) with increasing/persistent distress across recent messages. Acknowledge this pattern directly (e.g., 'I notice you've been feeling increasingly overwhelmed...') and provide stronger validation and support."
    if cultural_context:
         full_prompt.append(f"CULTURAL CONTEXT: {cultural_context}")
         
    if detected_mood:
         full_prompt.append(f"CONTEXT: User's detected mood is: {detected_mood}. Acknowledge this feeling empathetically.")
         
    if timeline_context:
         full_prompt.append(timeline_context)
         
    if severity == "RED":
        full_prompt.append("CRITICAL: User is in crisis. Respond with URGENT empathy and mention Kiran (1800-599-0019), Sneha Foundation (044-24640050), or iCall (9152987821). Do NOT act like a doctor.")
        
    if target_lang and not target_lang.startswith('en'):
        full_prompt.append(f"Always respond in the language code: {target_lang}. Think natively in that language.")
        
    full_prompt.append("CONVERSATION HISTORY:")
    if history:
        for msg in history[-5:]:
            role_name = "User" if msg.get("role") == "user" else "AI"
            content = msg.get("content", "")
            full_prompt.append(f"{role_name}: {content}")
        
    full_prompt.append(f"User: {user_message}\nAI:")
    
    final_prompt = "\n".join(full_prompt)
    
    try:
        response = gemini_client.models.generate_content(
            model=GEMINI_MODEL,
            contents=final_prompt,
        )
        return response.text
    except Exception as e:
        print(f"Error calling Gemini: {e}")
        return triage_engine.generate_rule_based_response(user_message, severity, history, detected_mood)
