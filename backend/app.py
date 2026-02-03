import os
import time
from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, User, Conversation, MoodEntry, JournalEntry
from auth import generate_token, token_required
from triage_engine import triage_engine, enhanced_triage_engine
from deep_translator import GoogleTranslator

app = Flask(__name__)
CORS(app)

# Database Configuration
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'care_nest.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'care-nest-secret-key-change-in-production')

db.init_app(app)

# OpenAI Configuration
# Gemini Configuration
try:
    import google.generativeai as genai
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    if GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)
        # Configure model
        gemini_model = genai.GenerativeModel('gemini-pro')
        USE_AI = True
        print("[SUCCESS] Google Gemini AI enabled")
    else:
        USE_AI = False
        print("[WARNING] No GEMINI_API_KEY found - using fallback responses")
except ImportError:
    USE_AI = False
    print("[WARNING] google-generativeai package not installed - using fallback responses")

# Create tables
with app.app_context():
    db.create_all()

# Enhanced System Prompt with Strict Constraints
SYSTEM_PROMPT = """
You are **Care Nest**, an empathetic, non-judgmental AI mental health assistant.
Your dual role is to provide **Emotional Support** AND **Accurate Mental Health Information**.

### 🚨 CRITICAL CONSTRAINTS (BREAKING THESE INVALIDATES THE RESPONSE):

1. **❌ NO CROSS-PAGE CONTEXT LEAKAGE**
   - You are ONLY a chat assistant. You have NO knowledge of other Care Nest features.
   - NEVER mention: Journal, Relaxation, Resources, Analytics, Assessment pages.
   - NEVER say "check the journal page" or "use our relaxation tools".
   - If asked about features, respond: "I'm here to chat and support you. What's on your mind?"

2. **🔁 DETERMINISTIC OUTPUT**
   - Same input + same context → SAME output.
   - NO randomness, NO varied phrasings for identical situations.
   - NO "Let me think..." or "Hmm..." - be direct and consistent.

3. **🧠 NO HIDDEN MEMORY**
   - You have NO memory beyond the conversation history provided.
   - NEVER reference "last week" or "earlier sessions" unless explicitly in the current history.
   - Each response is based ONLY on: current message + provided history + detected mood/severity.

4. **📦 STRUCTURED RESPONSE FORMAT**
   - Keep responses concise (2-4 sentences for normal chat, 1-2 for crisis).
   - Use clear, simple language. Avoid jargon.
   - For crisis (RED severity): ALWAYS mention Tele MANAS (14416) in the first sentence.

### 🛡️ SAFETY & COMPLIANCE RULES (MANDATORY):

5. **📚 NO COPYRIGHTED CONTENT**
   - NEVER quote copyrighted books, articles, or therapeutic materials.
   - Use only general, public-domain mental health knowledge.
   - If asked about specific books/programs, provide general descriptions only.

6. **⚕️ NO PERSONAL OR MEDICAL DIAGNOSIS**
   - You are NOT a doctor, therapist, or licensed professional.
   - NEVER diagnose mental health conditions (e.g., "You have depression").
   - Instead say: "It sounds like you're experiencing symptoms of [condition]. A professional can provide a proper assessment."
   - ALWAYS include disclaimer: "I'm an AI assistant, not a medical professional."

7. **🔒 NO PRIVATE OR IDENTIFIABLE DATA**
   - NEVER ask for: full name, address, phone number, medical records, or ID numbers.
   - NEVER store or reference private information.
   - If user shares sensitive data, respond: "I appreciate you sharing, but I don't need personal details to support you."

8. **💙 NON-JUDGMENTAL, SUPPORTIVE LANGUAGE ONLY**
   - NEVER use: "You should", "You must", "That's wrong", "Don't feel that way".
   - ALWAYS use: "It sounds like", "Many people feel", "One option could be", "What feels right for you?"
   - Validate feelings before offering suggestions.
   - No shame, blame, or minimizing language.

9. **🧭 ETHICAL MENTAL HEALTH AI BEHAVIOR**
   - Prioritize user safety above all else.
   - Recognize limitations: "This is beyond my capabilities. Please speak with a professional."
   - Encourage professional help for serious concerns.
   - Respect autonomy: Users make their own decisions.
   - Cultural sensitivity: Honor diverse backgrounds and beliefs.
   - Transparency: Be clear about being an AI.

### 🌟 Core Objectives:
1.  **Support**: Create a safe, calm space for users to express feelings.
2.  **Educate**: Provide clear, science-backed explanations when asked about mental health concepts.
3.  **Guide**: Offer practical, actionable tips for well-being.

### 🧠 Knowledge Base Guidelines:
-   **If asked for information** (e.g., "Tell me about bipolar disorder"):
    -   Provide a concise, easy-to-understand definition (2-3 sentences).
    -   List 2-3 common symptoms/signs.
    -   Suggest general management strategies (lifestyle, therapy types).
    -   *Disclaimer*: Always remind the user you are an AI and not a doctor.
-   **If asked for tips** (e.g., "I can't sleep"):
    -   Offer 1-2 specific techniques (4-7-8 breathing, progressive relaxation).
    -   Suggest 1-2 lifestyle adjustments (limit screen time, caffeine).
-   **Tone**: Educational but warm. Avoid dry medical jargon. Use metaphors if helpful.

### 🎭 Conversation Behavior:
-   **Validation First**: "It sounds like you're curious about..." or "That's a great question."
-   **Clarity**: Use bullet points or short paragraphs for information.
-   **Empathy**: Even when educating, maintain a supportive tone.
-   **Safety**: If a user asks about self-harm methods, **REFUSE** and redirect to crisis support immediately.

### ⚠️ Distress & Safety Protocols:
-   **Level 0-2 (Mild/Moderate)**: Validate feelings, offer tips, ask open questions.
-   **Level 3 (High Distress)**: Prioritize grounding. "I can hear how overwhelmed you are. Let's take a breath."
-   **Level 4 (Crisis)**: DIRECTIVE SAFETY. "I am concerned for your safety. Please reach out to Tele MANAS (14416) or a hospital immediately."

### 🇮🇳 Cultural & Multilingual Context:
-   **Languages Supported**: Fluent in English, Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, and Marathi.
-   **Code-Mixing**: Understand "Hinglish", "Tanglish", etc. (e.g., "I feel very ghabrahat today", "Manasu sari illa").
-   **Cultural Idioms**:
    -   "Feeling heavy" / "Bhaari mann" → Interpret as sadness/depression.
    -   "Not in mood" / "Mood off" → Interpret as low motivation or mild depression.
    -   "Mind is tired" / "Dimag thak gaya hai" → Interpret as mental exhaustion/burnout.
    -   "Nothing feels right" / "Kuch acha nahi lag raha" → Interpret as anhedonia or deep distress.
-   **Indirect Distress**: Indian users often express pain indirectly (e.g., somatic complaints like "headache from tension" often mean stress). Validate the emotion behind the physical symptom.
-   **Family Dynamics**: Respect the complexity of "Joint Family" pressure, "Log Kya Kahenge" (social stigma), and "Academic/Career Validation".

### 📋 RESPONSE VALIDATION CHECKLIST (INTERNAL):
Before responding, verify:
- [ ] No mentions of other Care Nest pages/features
- [ ] Response is deterministic (no random elements)
- [ ] Based only on provided context (no assumed memory)
- [ ] Follows severity protocol (RED = crisis helpline in first sentence)
- [ ] Concise and clear (2-4 sentences max for normal chat)
- [ ] No copyrighted content
- [ ] No medical diagnosis
- [ ] No request for private data
- [ ] Non-judgmental language
- [ ] Ethical and safe

**Opening Message**: "Hi, I'm Care Nest 💙 I'm here to listen and support you. What's on your mind?"
"""

# ============ AUTH ROUTES ============

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    
    # Validation
    if not data.get('name') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Check if user exists
    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({'error': 'Email already registered'}), 400
    
    # Create user
    user = User(name=data['name'], email=data['email'], age_group=data.get('age'))
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    # Generate token
    token = generate_token(user.id)
    
    return jsonify({
        'message': 'User created successfully',
        'token': token,
        'user': user.to_dict()
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing email or password'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    token = generate_token(user.id)
    
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': user.to_dict()
    })

@app.route('/api/anonymous-login', methods=['POST'])
def anonymous_login():
    import uuid
    import random
    import string
    
    # Generate unique anonymous credentials
    anon_id = str(uuid.uuid4())[:8]
    anon_email = f"anon_{anon_id}@carenest.local"
    # Generate high-entropy random password
    chars = string.ascii_letters + string.digits + "!@#$%"
    anon_password = ''.join(random.choice(chars) for i in range(16))
    
    try:
        # Create user
        user = User(
            name="Anonymous Guest",
            email=anon_email,
            age_group="18+" # Default safer assumption, or let them pick later
        )
        user.set_password(anon_password)
        
        db.session.add(user)
        db.session.commit()
        
        # Generate token
        token = generate_token(user.id)
        
        return jsonify({
            'message': 'Anonymous session started',
            'token': token,
            'user': user.to_dict(),
            'is_anonymous': True
        }), 201
        
    except Exception as e:
        print(f"Anon Login Error: {e}")
        return jsonify({'error': 'Failed to create anonymous session'}), 500

@app.route('/api/me', methods=['GET'])
@token_required
def get_current_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'user': user.to_dict()})

@app.route('/api/update-profile', methods=['POST'])
@token_required
def update_profile(user_id):
    """Update user profile information (age group, preferences, etc.)"""
    try:
        data = request.json
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Update age group if provided
        if 'age_group' in data:
            user.age_group = data['age_group']
        
        # Update name if provided
        if 'name' in data:
            user.name = data['name']
        
        # Update language preference if provided
        if 'language' in data:
            user.language = data.get('language', 'en')
        
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        print(f"Profile Update Error: {e}")
        db.session.rollback()
        return jsonify({'error': 'Failed to update profile'}), 500

@app.route('/api/analytics', methods=['GET'])
@token_required
def get_analytics(user_id):
    # Fetch user's mood history
    moods = MoodEntry.query.filter_by(user_id=user_id).order_by(MoodEntry.created_at.asc()).all()
    
    # Fetch conversation history for distress trends
    conversations = Conversation.query.filter_by(user_id=user_id).all()
    
    # Calculate total sessions (conversations)
    total_sessions = len(conversations)
    
    # Calculate mood distribution
    mood_counts = {}
    for mood_entry in moods:
        mood_name = mood_entry.mood
        mood_counts[mood_name] = mood_counts.get(mood_name, 0) + 1
    
    # Format mood distribution for frontend
    mood_colors = {
        'happy': 'bg-green-500',
        'calm': 'bg-blue-500',
        'sad': 'bg-purple-500',
        'anxious': 'bg-yellow-500',
        'angry': 'bg-red-500',
        'stressed': 'bg-orange-500',
        'confused': 'bg-gray-500'
    }
    
    mood_distribution = [
        {
            'mood': mood.capitalize(),
            'count': count,
            'color': mood_colors.get(mood.lower(), 'bg-gray-500')
        }
        for mood, count in mood_counts.items()
    ]
    
    # Calculate average mood (most common)
    average_mood = 'Calm'
    if mood_counts:
        average_mood = max(mood_counts, key=mood_counts.get).capitalize()
    
    # Generate weekly trend (last 7 days)
    from datetime import datetime, timedelta
    today = datetime.now()
    weekly_trend = []
    days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    
    for i in range(7):
        day_date = today - timedelta(days=6-i)
        day_name = days[day_date.weekday()]
        
        # Get moods for this day
        day_moods = [m for m in moods if m.created_at.date() == day_date.date()]
        
        # Calculate average intensity for the day (1-10 scale)
        if day_moods:
            avg_intensity = sum(m.intensity for m in day_moods) / len(day_moods)
            mood_score = int(avg_intensity)
        else:
            mood_score = 5  # Default neutral
        
        weekly_trend.append({
            'day': day_name,
            'mood': mood_score
        })
    
    return jsonify({
        'totalSessions': total_sessions,
        'averageMood': average_mood,
        'moodDistribution': mood_distribution,
        'weeklyTrend': weekly_trend
    })


# ============ CHAT ROUTES ============

@app.route('/api/chat', methods=['POST'])
@token_required
def chat(user_id):
    data = request.json
    user_message = data.get('message', '')
    
    if not user_message:
        return jsonify({'error': 'Message is required'}), 400
    
    # Get or create conversation
    conversation = Conversation.query.filter_by(user_id=user_id).order_by(Conversation.updated_at.desc()).first()
    
    if not conversation:
        conversation = Conversation(user_id=user_id)
        conversation.set_messages([])
        db.session.add(conversation)
    
    # Add user message
    conversation.add_message('user', user_message)
    
    # Extract emojis from message
    emojis = triage_engine.extract_emojis(user_message)
    emoji_context = ''.join(emojis) if emojis else None
    
    # Triage the message with emoji context
    severity, reason, intensity = triage_engine.analyze_severity(user_message, emoji_context)
    
    # Map Intensity (1-10) to Distress Level (0-4) per user spec
    if intensity <= 2: distress_level = 0
    elif intensity <= 4: distress_level = 1
    elif intensity <= 6: distress_level = 2
    elif intensity <= 8: distress_level = 3
    else: distress_level = 4

    # Detect mood
    detected_mood, mood_confidence, mood_reason = triage_engine.detect_mood(user_message, emoji_context)
    
    # Auto-save mood to database if confidence is high (for graph tracking)
    # Lowered threshold to 30 to catch more subtle moods for testing
    if detected_mood and mood_confidence > 30:
        try:
            # Check if we already saved a mood very recently (last 5 mins) to avoid spam? 
            # For now, just save it.
            mood_entry = MoodEntry(
                user_id=user_id,
                mood=detected_mood,
                intensity=intensity
            )
            db.session.add(mood_entry)
        except Exception as e:
            print(f"Error auto-saving mood: {e}")

    # Generate AI Response with intensity and mood awareness
    # Get language from request
    target_lang = data.get('language', 'en')
    print(f"🌐 DEBUG: Received language code: {target_lang}")
    
    ai_response = generate_ai_response(
        user_message, 
        severity, 
        intensity, 
        conversation.get_messages(), 
        detected_mood,
        target_lang=target_lang
    )
    
    # Add AI message
    conversation.add_message('ai', ai_response, severity, distress_level)
    
    db.session.commit()
    
    return jsonify({
        'response': ai_response,
        'triage_status': severity,
        'distress_level': distress_level,
        'intensity': intensity,
        'detected_emojis': emojis,
        'detected_mood': detected_mood,
        'mood_confidence': mood_confidence,
        'timestamp': time.time()
    })

# ============ MOOD TRACKING ROUTES ============

@app.route('/api/mood', methods=['POST'])
@token_required
def log_mood(user_id):
    data = request.json
    mood = data.get('mood')
    intensity = data.get('intensity', 5)
    
    if not mood:
        return jsonify({'error': 'Mood is required'}), 400
        
    try:
        entry = MoodEntry(user_id=user_id, mood=mood, intensity=intensity)
        db.session.add(entry)
        db.session.commit()
        return jsonify({'message': 'Mood logged successfully', 'entry': entry.to_dict()}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- Routes ---

@app.route('/api/resources', methods=['GET'])
def get_mental_health_resources():
    state = request.args.get('state', 'National')
    data = get_resources_by_state(state)
    return jsonify(data), 200

@app.route('/api/book_appointment', methods=['POST'])
def book_appointment():
    # Mock Booking Logic
    # In a real app, this would send SMS/Email via Twilio/SendGrid
    data = request.json
    doctor_name = data.get('doctor_name')
    print(f"Booking Request received for {doctor_name} from {data.get('contact')}")
    
    return jsonify({
        "success": True, 
        "message": f"Appointment request sent to {doctor_name}. You will receive a confirmation SMS shortly."
    }), 200

@app.route('/api/user/update', methods=['PUT'])
@token_required
def update_user(current_user_id):
    data = request.json
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    if 'age_group' in data:
        user.age_group = data['age_group']
        
    db.session.commit()
    return jsonify({'message': 'Profile updated successfully', 'user': user.to_dict()})

@app.route('/api/conversations', methods=['GET'])
@token_required
def get_conversations(user_id):
    conversations = Conversation.query.filter_by(user_id=user_id).order_by(Conversation.updated_at.desc()).all()
    
    return jsonify({
        'conversations': [
            {
                'id': conv.id,
                'messages': conv.get_messages(),
                'created_at': conv.created_at.isoformat(),
                'updated_at': conv.updated_at.isoformat()
            }
            for conv in conversations
        ]
    })

@app.route('/api/conversations/<int:conversation_id>', methods=['GET'])
@token_required
def get_conversation(user_id, conversation_id):
    conversation = Conversation.query.filter_by(id=conversation_id, user_id=user_id).first()
    
    if not conversation:
        return jsonify({'error': 'Conversation not found'}), 404
    
    return jsonify({
        'id': conversation.id,
        'messages': conversation.get_messages(),
        'created_at': conversation.created_at.isoformat()
    })

@app.route('/api/user-distress-status', methods=['GET'])
@token_required
def get_user_distress_status(user_id):
    """Get user's current distress level and resource recommendations"""
    try:
        from datetime import datetime, timedelta
        
        # Get conversations from last 7 days
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        recent_conversations = Conversation.query.filter(
            Conversation.user_id == user_id,
            Conversation.updated_at >= seven_days_ago
        ).all()
        
        if not recent_conversations:
            return jsonify({
                'distress_level': 0,
                'category': 'low',
                'recommendation': 'self-help',
                'message': 'No recent conversations found. Feel free to chat with us anytime!',
                'show_emergency': False
            })
        
        # Calculate average distress level from recent messages
        distress_levels = []
        for conv in recent_conversations:
            messages = conv.get_messages()
            for msg in messages:
                if msg.get('role') == 'ai' and 'distress_level' in msg:
                    distress_levels.append(msg['distress_level'])
        
        if not distress_levels:
            avg_distress = 0
        else:
            avg_distress = sum(distress_levels) / len(distress_levels)
        
        # Determine category and recommendation
        if avg_distress <= 2:
            category = 'low'
            recommendation = 'self-help'
            message = 'You\'re doing well! Continue with self-care practices.'
            show_emergency = False
        elif avg_distress <= 4:
            category = 'medium'
            recommendation = 'counselor'
            message = 'Consider speaking with a counselor for additional support.'
            show_emergency = False
        elif avg_distress <= 6:
            category = 'high'
            recommendation = 'counselor'
            message = 'We recommend connecting with a professional counselor.'
            show_emergency = True
        else:
            category = 'critical'
            recommendation = 'psychiatrist'
            message = 'Please consider consulting a psychiatrist for comprehensive care.'
            show_emergency = True
        
        return jsonify({
            'distress_level': round(avg_distress, 1),
            'category': category,
            'recommendation': recommendation,
            'message': message,
            'show_emergency': show_emergency,
            'days_analyzed': 7,
            'total_messages': len(distress_levels)
        })
        
    except Exception as e:
        print(f"Distress Status Error: {e}")
        return jsonify({'error': 'Failed to get distress status'}), 500

# ============ MOOD ROUTES ============

@app.route('/api/mood', methods=['POST'])
@token_required
def add_mood(user_id):
    data = request.json
    
    if not data.get('mood'):
        return jsonify({'error': 'Mood is required'}), 400
    
    mood_entry = MoodEntry(
        user_id=user_id,
        mood=data['mood'],
        intensity=data.get('intensity', 5),
        note=data.get('note', '')
    )
    
    db.session.add(mood_entry)
    db.session.commit()
    
    return jsonify({
        'message': 'Mood recorded',
        'mood': mood_entry.to_dict()
    }), 201

@app.route('/api/mood/history', methods=['GET'])
@token_required
def get_mood_history(user_id):
    moods = MoodEntry.query.filter_by(user_id=user_id).order_by(MoodEntry.created_at.desc()).limit(30).all()
    
    return jsonify({
        'moods': [mood.to_dict() for mood in moods]
    })

# ============ JOURNAL ROUTES ============

@app.route('/api/journal', methods=['POST'])
@token_required
def create_journal_entry(user_id):
    data = request.json
    
    if not data.get('content'):
        return jsonify({'error': 'Content is required'}), 400
    
    # AI/Rule-based Analysis
    severity, reason, intensity = triage_engine.analyze_severity(data['content'])
    detected_mood, confidence, mood_reason = triage_engine.detect_mood(data['content'])

    # Auto-tag mood if not provided
    mood_tag = data.get('mood_tag')
    if not mood_tag and detected_mood:
        mood_tag = detected_mood

    entry = JournalEntry(
        user_id=user_id,
        title=data.get('title', 'Untitled Entry'),
        content=data['content'],
        mood_tag=mood_tag
    )
    
    db.session.add(entry)
    db.session.commit()
    
    return jsonify({
        'message': 'Journal entry saved',
        'entry': entry.to_dict(),
        'analysis': {
            'severity': severity,
            'reason': reason,
            'intensity': intensity,
            'detected_mood': detected_mood
        }
    }), 201

    return jsonify({
        'entries': [e.to_dict() for e in entries]
    })

@app.route('/api/admin/insights', methods=['GET'])
def get_admin_insights():
    # 1. Usage Trends (New Users over last 7 days)
    # Simplified: Just returning total counts for MVP
    total_users = User.query.count()
    total_conversations = Conversation.query.count()
    
    # 2. Distress Level Distribution (from Conversations)
    # We need to iterate messages, but for performance let's look at recent messages in Conversations
    # Or rely on MoodEntries which are structured
    distress_counts = {'High (Red)': 0, 'Moderate (Yellow)': 0, 'Low (Green)': 0}
    
    # Analyze Mood Entries for "Effectiveness" and "Distress"
    moods = MoodEntry.query.all()
    mood_breakdown = {}
    
    for m in moods:
        # Distress Distribution based on Intensity
        if m.intensity >= 8:
            distress_counts['High (Red)'] += 1
        elif m.intensity >= 4:
            distress_counts['Moderate (Yellow)'] += 1
        else:
            distress_counts['Low (Green)'] += 1
            
        # Mood Breakdown
        mood_breakdown[m.mood] = mood_breakdown.get(m.mood, 0) + 1

    # 3. Effectiveness (Avg Intensity Trend)
    # Group by date
    from sqlalchemy import func
    daily_intensity = db.session.query(
        func.date(MoodEntry.created_at), 
        func.avg(MoodEntry.intensity)
    ).group_by(func.date(MoodEntry.created_at)).all()
    
    effectiveness_trend = [{'date': str(day), 'avg_intensity': round(val, 1)} for day, val in daily_intensity]

    return jsonify({
        'usage': {
            'total_users': total_users,
            'total_conversations': total_conversations
        },
        'distress_distribution': [
            {'name': k, 'value': v} for k, v in distress_counts.items()
        ],
        'mood_breakdown': [
            {'name': k, 'value': v} for k, v in mood_breakdown.items()
        ],
        'effectiveness_trend': effectiveness_trend
    })

# ============ HELPER FUNCTIONS ============

def generate_ai_response(user_message, severity, intensity, conversation_history, detected_mood=None, target_lang='en'):
    """Generate contextual AI response using GPT or fallback with translation"""
    
    # If GPT is available, use it (Pass language instruction in prompt naturally via system prompt)
    # If AI is available, use it (Pass language instruction in prompt naturally via system prompt)
    if USE_AI:
        try:
            ai_response = generate_gemini_response(user_message, severity, intensity, conversation_history, detected_mood, target_lang)
            
            # FALLBACK TRANSLATION using Gemini API: Only translate if AI responded in English despite instructions
            # Check if response contains mostly English characters (simple heuristic)
            if target_lang and not target_lang.startswith('en'):
                # Count English vs non-English characters
                english_chars = sum(1 for c in ai_response if ord(c) < 128 and c.isalpha())
                total_chars = sum(1 for c in ai_response if c.isalpha())
                
                # If more than 80% English characters, AI didn't follow instructions - translate as fallback
                if total_chars > 0 and (english_chars / total_chars) > 0.8:
                    try:
                        # Map language codes to language names
                        lang_name_map = {
                            'hi-IN': 'Hindi', 'hi': 'Hindi',
                            'ta-IN': 'Tamil', 'ta': 'Tamil',
                            'te-IN': 'Telugu', 'te': 'Telugu',
                            'kn-IN': 'Kannada', 'kn': 'Kannada',
                            'ml-IN': 'Malayalam', 'ml': 'Malayalam',
                            'bn-IN': 'Bengali', 'bn': 'Bengali',
                            'mr-IN': 'Marathi', 'mr': 'Marathi'
                        }
                        
                        target_language_name = lang_name_map.get(target_lang, target_lang)
                        print(f"⚠️ AI responded in English - Using Gemini for translation to {target_language_name}")
                        
                        # Use Gemini API for high-quality, context-aware translation
                        translation_prompt = f"""
Translate the following mental health support message to {target_language_name}.

IMPORTANT INSTRUCTIONS:
1. Maintain the empathetic and supportive tone
2. Use natural, conversational {target_language_name} (not literal translation)
3. Use culturally appropriate expressions
4. Preserve the emotional warmth and care in the message
5. Sound like a native {target_language_name} mental health counselor

Original message in English:
{ai_response}

Translated message in {target_language_name}:"""

                        translation_response = gemini_model.generate_content(translation_prompt)
                        translated_text = translation_response.text.strip()
                        
                        print(f"✅ Gemini translation complete to {target_language_name}")
                        return translated_text
                        
                    except Exception as e:
                        print(f"⚠️ Gemini translation error: {e}. Trying Google Translate fallback.")
                        # Fallback to Google Translate if Gemini fails
                        try:
                            lang_code_map = {
                                'hi-IN': 'hi', 'hi': 'hi',
                                'ta-IN': 'ta', 'ta': 'ta',
                                'te-IN': 'te', 'te': 'te',
                                'kn-IN': 'kn', 'kn': 'kn',
                                'ml-IN': 'ml', 'ml': 'ml',
                                'bn-IN': 'bn', 'bn': 'bn',
                                'mr-IN': 'mr', 'mr': 'mr'
                            }
                            translation_code = lang_code_map.get(target_lang, target_lang)
                            translated_response = GoogleTranslator(source='auto', target=translation_code).translate(ai_response)
                            print(f"✅ Google Translate fallback complete")
                            return translated_response
                        except Exception as e2:
                            print(f"⚠️ All translation failed: {e2}. Returning original response.")
                            return ai_response
                else:
                    print(f"✅ AI responded natively in {target_lang}")
            
            return ai_response
            
        except Exception as e:
            print(f"GPT Error: {e}. Falling back to keyword responses.")
            # Fall through to keyword-based responses
    
    # Fallback: Keyword-based responses via Triage Engine
    # (This handles Knowledge Base, Severity, Mood, and Conversation Flow)
    base_response = triage_engine.generate_rule_based_response(user_message, severity, conversation_history, detected_mood)
    
    # Mood acknowledgment prefix
    mood_prefix = ""
    if detected_mood:
        mood_responses = {
            'happy': "I can sense you're feeling good! ",
            'sad': "I hear that you're feeling down. ",
            'anxious': "It sounds like you're feeling anxious. ",
            'angry': "I can tell you're feeling frustrated. ",
            'stressed': "You seem really stressed right now. ",
            'calm': "I'm glad you're feeling calm. ",
            'confused': "It sounds like you're feeling uncertain. "
        }
        mood_prefix = mood_responses.get(detected_mood, "")
    
    final_response = f"{mood_prefix}{base_response}"
    
    # Translate if target language is not English
    if target_lang and target_lang != 'en':
        try:
            final_response = GoogleTranslator(source='auto', target=target_lang).translate(final_response)
        except Exception as e:
            print(f"Translation Error: {e}")
            
            
    # Proactive Mood Check-in (Soft Reflective Questions)
    # Only ask if:
    # 1. No detected mood (so we don't ask if they just told us)
    # 2. Conversation has some depth (history length > 2)
    # 3. Random chance (to avoid being annoying, e.g., 30% chance)
    # 4. No Coping Strategy was just recommended (don't overwhelm)
    import random
    
    # Get Coping Strategy first
    coping_strategy = None
    if detected_mood and 3 <= intensity <= 8:
         # Only recommend if mood is clear and intensity is moderate
         coping_strategy = triage_engine.get_coping_strategy(detected_mood, intensity)
    
    # Append Coping Strategy (Priority over Mood Check-in)
    if coping_strategy:
        # Translate strategy if needed
        if target_lang and target_lang != 'en':
             try:
                coping_strategy = GoogleTranslator(source='auto', target=target_lang).translate(coping_strategy)
             except:
                pass
        final_response += f"\n\n{coping_strategy}"
        
    # Append Mood Check-in (Secondary Priority)
    elif not detected_mood and len(conversation_history) > 2 and random.random() < 0.3:
        mood_questions = [
            "\n\n(If you had to pick one word for your mood right now, what would it be?)",
            "\n\n(How is your 'internal weather' feeling at this moment?)",
            "\n\n(On a scale of 'Stormy' to 'Sunny', where are you right now?)",
            "\n\n(Checking in: How heavy does your mind feel on a scale of 1-10?)"
        ]
        
        # Translate the question too if needed
        question = random.choice(mood_questions)
        if target_lang and target_lang != 'en':
             try:
                question = GoogleTranslator(source='auto', target=target_lang).translate(question)
             except:
                pass
    return final_response

def validate_ai_response(response_text, severity):
    """
    Validate AI response against strict constraints and safety rules.
    Returns (is_valid, error_message)
    """
    errors = []
    
    # Check 1: No cross-page context leakage
    forbidden_terms = [
        'journal page', 'journaling feature', 'journal section',
        'relaxation page', 'relax page', 'relaxation tools',
        'resources page', 'resource section',
        'analytics page', 'analytics dashboard',
        'assessment page', 'take the assessment',
        'check out our', 'visit our', 'go to the'
    ]
    
    response_lower = response_text.lower()
    for term in forbidden_terms:
        if term in response_lower:
            errors.append(f"Cross-page context leakage detected: '{term}'")
    
    # Check 2: Crisis protocol compliance
    if severity == "RED":
        if "14416" not in response_text and "tele manas" not in response_lower:
            errors.append("Crisis response missing Tele MANAS helpline")
    
    # Check 3: Response length (should be concise)
    sentence_count = response_text.count('.') + response_text.count('!') + response_text.count('?')
    if severity != "RED" and sentence_count > 6:
        errors.append(f"Response too long: {sentence_count} sentences (max 6 for normal chat)")
    
    # Check 4: No vague memory references
    vague_memory_terms = [
        'last week', 'earlier session', 'previously mentioned',
        'as we discussed before', 'remember when'
    ]
    for term in vague_memory_terms:
        if term in response_lower:
            errors.append(f"Vague memory reference detected: '{term}'")
    
    # Check 5: No medical diagnosis (SAFETY RULE)
    diagnosis_terms = [
        'you have depression', 'you have anxiety', 'you have bipolar',
        'you have ptsd', 'you have ocd', 'you are depressed',
        'you are bipolar', 'diagnosed with', 'you suffer from'
    ]
    for term in diagnosis_terms:
        if term in response_lower:
            errors.append(f"Medical diagnosis detected: '{term}' - AI cannot diagnose")
    
    # Check 6: No requests for private data (SAFETY RULE)
    private_data_requests = [
        'what is your full name', 'what is your address', 'phone number',
        'medical records', 'id number', 'social security', 'aadhar number'
    ]
    for term in private_data_requests:
        if term in response_lower:
            errors.append(f"Private data request detected: '{term}'")
    
    # Check 7: Non-judgmental language (SAFETY RULE)
    judgmental_terms = [
        'you should feel', 'you must', "that's wrong", "don't feel that way",
        'stop feeling', 'just get over it', 'snap out of it'
    ]
    for term in judgmental_terms:
        if term in response_lower:
            errors.append(f"Judgmental language detected: '{term}'")
    
    is_valid = len(errors) == 0
    error_message = "; ".join(errors) if errors else None
    
    return is_valid, error_message

def generate_gemini_response(user_message, severity, intensity, conversation_history, detected_mood=None, target_lang='en'):
    """Generate response using Google Gemini with context awareness and validation"""
    
    # Map language codes to full language names
    language_map = {
        'en-IN': 'English',
        'en': 'English',
        'hi-IN': 'Hindi',
        'hi': 'Hindi',
        'ta-IN': 'Tamil',
        'ta': 'Tamil',
        'te-IN': 'Telugu',
        'te': 'Telugu',
        'kn-IN': 'Kannada',
        'kn': 'Kannada',
        'ml-IN': 'Malayalam',
        'ml': 'Malayalam',
        'bn-IN': 'Bengali',
        'bn': 'Bengali',
        'mr-IN': 'Marathi',
        'mr': 'Marathi'
    }
    
    # Debug logging
    language_name = language_map.get(target_lang, 'English')
    print(f"🌐 DEBUG: Language code '{target_lang}' mapped to '{language_name}'")
    
    # Construct the full prompt context
    full_prompt = [f"SYSTEM INSTRUCTION: {SYSTEM_PROMPT}"]
    
    # Language Instruction - NATIVE LANGUAGE MODE
    language_name = language_map.get(target_lang, 'English')
    if target_lang and not target_lang.startswith('en'):
        full_prompt.append(
            f"""
🌐 NATIVE {language_name.upper()} MODE ACTIVATED:

1. THINK NATIVELY: Don't translate from English. Think directly in {language_name}.

2. USE NATURAL EXPRESSIONS: Use how native {language_name} speakers actually talk:
   - Natural conversational phrases
   - Cultural idioms and expressions  
   - Appropriate emotional vocabulary

3. EXAMPLES - Native vs Translated:
   
   For Hindi:
   ❌ Translated: "यह महसूस करना ठीक है"
   ✅ Native: "आपका ऐसा महसूस करना बिल्कुल स्वाभाविक है"
   
   ❌ Translated: "मैं यहाँ हूँ"  
   ✅ Native: "मैं आपके साथ हूँ"

4. UNDERSTAND CODE-MIXING: User may mix English+{language_name}. Understand it, but respond in pure {language_name}.

5. MENTAL HEALTH CONTEXT: Use culturally appropriate mental health terms in {language_name}.

⚠️ ABSOLUTE RULE: 100% {language_name}. Zero English words. Sound like a native {language_name} mental health counselor.
"""
        )
    else:
        full_prompt.append(f"LANGUAGE: Respond in {language_name}.")

    # Add mood context
    if detected_mood:
        full_prompt.append(f"CONTEXT: User's detected mood is: {detected_mood}. Acknowledge this feeling empathetically.")
    
    # Add severity context
    if severity == "RED":
        full_prompt.append(f"CRITICAL: User is in crisis (intensity {intensity}/10). Respond with URGENT empathy. Strongly encourage professional help. Mention Tele MANAS (14416).")
    elif severity == "YELLOW":
        full_prompt.append(f"IMPORTANT: User shows distress (intensity {intensity}/10). Gently suggest professional support.")

    # Add conversation history
    full_prompt.append("\nCONVERSATION HISTORY:")
    recent_history = conversation_history[-6:] if len(conversation_history) > 6 else conversation_history
    for msg in recent_history:
        role = "User" if msg['role'] == 'user' else "AI"
        full_prompt.append(f"{role}: {msg['text']}")
    
    # Add final language reminder for non-English languages
    if target_lang and not target_lang.startswith('en'):
        full_prompt.append(
            f"\n🌐 LANGUAGE REMINDER #2: Remember, respond ONLY in {language_name}. "
            f"Do not use any English words or phrases in your response."
        )
    
    # Add current user message
    full_prompt.append(f"\nUser (current message): {user_message}")
    full_prompt.append("AI:")
    
    # Combine into single string for Gemini
    final_prompt_text = "\n".join(full_prompt)
    
    try:
        response = gemini_model.generate_content(final_prompt_text)
        ai_response = response.text
        
        # Validate the response
        is_valid, error_message = validate_ai_response(ai_response, severity)
        
        if not is_valid:
            print(f"⚠️ AI Response Validation Failed: {error_message}")
            print(f"Invalid Response: {ai_response[:100]}...")
            # Log to file for review
            with open('ai_validation_errors.log', 'a', encoding='utf-8') as f:
                f.write(f"\n[{time.strftime('%Y-%m-%d %H:%M:%S')}] Validation Error: {error_message}\n")
                f.write(f"User Message: {user_message}\n")
                f.write(f"AI Response: {ai_response}\n")
                f.write("-" * 80 + "\n")
            
            # Fallback to rule-based response on validation failure
            return triage_engine.generate_rule_based_response(user_message, severity, conversation_history, detected_mood)
        
        return ai_response
        
    except Exception as e:
        print(f"Gemini API Error: {e}")
        # Fallback to triage engine if API fails
        return triage_engine.generate_rule_based_response(user_message, severity, conversation_history, detected_mood)

# ============ ADMIN/DEBUG ROUTES ============

@app.route('/api/admin/data', methods=['GET'])
def view_all_data():
    """Simple endpoint to view all stored data (for development/debugging)"""
    users = User.query.all()
    conversations = Conversation.query.all()
    moods = MoodEntry.query.all()
    
    return jsonify({
        'users': [
            {
                'id': u.id,
                'name': u.name,
                'email': u.email,
                'created_at': u.created_at.isoformat()
            } for u in users
        ],
        'conversations': [
            {
                'id': c.id,
                'user_id': c.user_id,
                'message_count': len(c.get_messages()),
                'last_updated': c.updated_at.isoformat()
            } for c in conversations
        ],
        'mood_entries': [m.to_dict() for m in moods],
        'total_users': len(users),
        'total_conversations': len(conversations),
        'total_moods': len(moods)
    })


# ============ ENHANCED TRIAGE ANALYSIS ENDPOINT ============

@app.route('/api/triage/analyze', methods=['POST'])
@token_required
def analyze_triage(user_id):
    """
    Dedicated endpoint for enhanced distress analysis.
    Accepts text and optional voice metadata.
    Returns structured triage output with confidence scores.
    """
    try:
        data = request.json
        text = data.get('text', '')
        voice_metadata = data.get('voice_metadata')  # Optional
        
        if not text:
            return jsonify({'error': 'Text is required'}), 400
        
        # Validate voice_metadata format if provided
        if voice_metadata:
            valid_tones = ['flat', 'crying', 'agitated', 'slowed', 'normal']
            valid_paces = ['slow', 'rapid', 'normal']
            valid_pauses = ['frequent', 'long', 'normal']
            
            tone = voice_metadata.get('tone', '').lower()
            pace = voice_metadata.get('pace', '').lower()
            pauses = voice_metadata.get('pauses', '').lower()
            
            if tone and tone not in valid_tones:
                return jsonify({'error': f'Invalid tone. Must be one of: {valid_tones}'}), 400
            if pace and pace not in valid_paces:
                return jsonify({'error': f'Invalid pace. Must be one of: {valid_paces}'}), 400
            if pauses and pauses not in valid_pauses:
                return jsonify({'error': f'Invalid pauses. Must be one of: {valid_pauses}'}), 400
        
        # Perform enhanced triage analysis
        result = enhanced_triage_engine.analyze_distress_enhanced(text, voice_metadata)
        
        # Log the analysis (anonymized)
        logger.info(f"Triage analysis: level={result['distress_level']}, confidence={result['confidence']}, voice={bool(voice_metadata)}")
        
        # Return structured output
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Triage analysis error: {str(e)}")
        return jsonify({'error': 'Triage analysis failed'}), 500


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
