import os
import time
from datetime import datetime
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, User, Conversation, Message, MoodEntry, JournalEntry, TimeLog, AssessmentResult
from auth import generate_token, token_required
from triage_engine import triage_engine, enhanced_triage_engine
from resources import get_resources_by_state
from openrouter_engine import generate_response as ai_generate_response

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Allow all origins in production (Vercel frontend → Render backend)
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Database Configuration
# Locally: SQLite. In production (Render/Railway): set DATABASE_URL env var to PostgreSQL URI.
basedir = os.path.abspath(os.path.dirname(__file__))
_default_db = 'sqlite:///' + os.path.join(basedir, 'care_nest_v2.db')
_database_url = os.getenv('DATABASE_URL', _default_db)
# Render returns postgres:// but SQLAlchemy requires postgresql://
if _database_url.startswith('postgres://'):
    _database_url = _database_url.replace('postgres://', 'postgresql://', 1)
app.config['SQLALCHEMY_DATABASE_URI'] = _database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'care-nest-secret-key-change-in-production')

db.init_app(app)

print("[INFO] Using Groq AI engine (llama-3.3-70b-versatile)")

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
   - ALWAYS follow this Empathetic Conversation Framework: 1. Acknowledge the user's feelings. 2. Ask a gentle follow-up question. 3. Provide a small actionable suggestion.
   - Use clear, simple language. Avoid jargon.
   - For crisis (RED severity): ALWAYS mention Kiran Helpline (1800-599-0019), Sneha Foundation (044-24640050), or iCall (9152987821) in the first sentence.

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
-   **Level 4 (Crisis)**: DIRECTIVE SAFETY. "I am concerned for your safety. Please reach out to Kiran (1800-599-0019), Sneha Foundation (044-24640050), or iCall (9152987821) immediately."

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
    
    # Create user, default to unverified
    import secrets
    user = User(name=data['name'], email=data['email'], age_group=data.get('age'), is_verified=False)
    user.set_password(data['password'])
    
    # Generate verification token
    user.verification_token = secrets.token_urlsafe(32)
    
    db.session.add(user)
    db.session.commit()
    
    dev_verify_link = f"http://localhost:5173/verify-email?token={user.verification_token}"
    
    # Do NOT return a JWT token, they must verify first
    return jsonify({
        'message': 'User created successfully. Please verify your email.',
        'user': user.to_dict(),
        'dev_verify_link': dev_verify_link
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing email or password'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
        
    if not user.is_verified:
        return jsonify({'error': 'Please verify your email address before logging in.'}), 403
    
    token = generate_token(user.id)
    
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': user.to_dict()
    })

@app.route('/api/forgot-password', methods=['POST'])
def forgot_password():
    data = request.json
    email = data.get('email')
    if not email:
        return jsonify({'error': 'Email is required'}), 400
        
    user = User.query.filter_by(email=email).first()
    if not user:
        # Don't reveal whether user exists for security, just succeed
        return jsonify({'message': 'If the email exists, a reset link will be sent.'}), 200
        
    import secrets
    from datetime import datetime, timedelta
    
    token = secrets.token_urlsafe(32)
    user.reset_token = token
    user.reset_token_expiry = datetime.utcnow() + timedelta(hours=1)
    db.session.commit()
    
    # In a real app, send email here. For dev, return it in the response so the frontend can display it.
    reset_link = f"http://localhost:5173/reset-password?token={token}"
    
    return jsonify({
        'message': 'Password reset token generated (simulated email sent)',
        'dev_reset_link': reset_link
    }), 200

@app.route('/api/reset-password', methods=['POST'])
def reset_password():
    data = request.json
    token = data.get('token')
    new_password = data.get('new_password')
    
    if not token or not new_password:
        return jsonify({'error': 'Token and new password are required'}), 400
        
    user = User.query.filter_by(reset_token=token).first()
    from datetime import datetime
    
    if not user or not user.reset_token_expiry or user.reset_token_expiry < datetime.utcnow():
        return jsonify({'error': 'Invalid or expired token'}), 400
        
    user.set_password(new_password)
    user.reset_token = None
    user.reset_token_expiry = None
    db.session.commit()
    
    return jsonify({'message': 'Password has been reset successfully'}), 200

@app.route('/api/change-password', methods=['POST'])
@token_required
def change_password(current_user):
    data = request.json
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    
    if not current_password or not new_password:
        return jsonify({'error': 'Current and new passwords are required'}), 400
        
    if not current_user.check_password(current_password):
        return jsonify({'error': 'Invalid current password'}), 401
        
    current_user.set_password(new_password)
    db.session.commit()
    
    return jsonify({'message': 'Password changed successfully'}), 200

@app.route('/api/verify-email', methods=['POST'])
def verify_email():
    data = request.json
    token = data.get('token')
    if not token:
        return jsonify({'error': 'Token is required'}), 400
        
    user = User.query.filter_by(verification_token=token).first()
    if not user:
        return jsonify({'error': 'Invalid verification token'}), 400
        
    user.is_verified = True
    user.verification_token = None
    db.session.commit()
    
    return jsonify({'message': 'Email successfully verified'}), 200

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
            age_group="18+", # Default safer assumption, or let them pick later
            is_verified=True # Anonymous users are auto-verified
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
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'user': user.to_dict()})

@app.route('/api/logout', methods=['POST'])
@token_required
def logout(user_id):
    """
    Logout endpoint that clears chat conversations for privacy
    but preserves analytics data (mood entries, journal entries)
    """
    try:
        # Delete all conversations for this user (chat messages)
        Conversation.query.filter_by(user_id=user_id).delete()
        
        # Keep mood entries and journal entries for analytics
        # They are NOT deleted
        
        db.session.commit()
        
        print(f"✅ User {user_id} logged out - Chat conversations cleared, analytics preserved")
        
        return jsonify({
            'message': 'Logged out successfully',
            'chat_cleared': True,
            'analytics_preserved': True
        }), 200
        
    except Exception as e:
        print(f"❌ Logout error: {e}")
        db.session.rollback()
        return jsonify({'error': 'Logout failed'}), 500

@app.route('/api/update-profile', methods=['POST'])
@token_required
def update_profile(user_id):
    """Update user profile information (age group, preferences, etc.)"""
    try:
        data = request.json
        user = db.session.get(User, user_id)
        
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

@app.route('/api/assessment', methods=['POST'])
@token_required
def save_assessment(user_id):
    try:
        data = request.json
        score = data.get('score')
        answers = data.get('answers')
        
        if score is None or answers is None:
            return jsonify({'error': 'Missing score or answers'}), 400
            
        import json
        new_result = AssessmentResult(
            user_id=user_id,
            score=score,
            answers=json.dumps(answers)
        )
        
        db.session.add(new_result)
        db.session.commit()
        
        return jsonify({
            'message': 'Assessment saved successfully',
            'assessment': new_result.to_dict()
        }), 201
        
    except Exception as e:
        print(f"Assessment Save Error: {e}")
        db.session.rollback()
        return jsonify({'error': 'Failed to save assessment'}), 500

@app.route('/api/analytics', methods=['GET'])
@token_required
def get_analytics(user_id):
    days_count = request.args.get('days', default=7, type=int)
    
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
    
    # Generate trend based on days_count
    from datetime import datetime, timedelta
    today = datetime.now()
    weekly_trend = []
    days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    
    for i in range(days_count):
        day_date = today - timedelta(days=(days_count - 1) - i)
        day_label = day_date.strftime('%b %d') if days_count > 7 else days[day_date.weekday()]
        
        # Get moods for this day
        day_moods = [m for m in moods if m.created_at.date() == day_date.date()]
        
        # Calculate average intensity for the day (1-10 scale)
        if day_moods:
            avg_intensity = sum(m.intensity for m in day_moods) / len(day_moods)
            mood_score = int(avg_intensity)
        else:
            mood_score = 5  # Default neutral
        
        weekly_trend.append({
            'day': day_label,
            'mood': mood_score
        })
        
    # Generate time spent trend
    time_logs = TimeLog.query.filter_by(user_id=user_id).all()
    weekly_time_trend = []
    total_time_spent = 0
    for i in range(days_count):
        day_date = today - timedelta(days=(days_count - 1) - i)
        day_label = day_date.strftime('%b %d') if days_count > 7 else days[day_date.weekday()]
        day_time_logs = [t for t in time_logs if t.created_at.date() == day_date.date()]
        day_minutes = sum(t.minutes for t in day_time_logs)
        weekly_time_trend.append({
            'day': day_label,
            'minutes': day_minutes
        })
        total_time_spent += day_minutes
    
    # Calculate Wellbeing Score (out of 10)
    last_7_days_moods = [m for m in moods if (today - m.created_at).days <= 7]
    wellbeing_score = 7.5  # Default
    
    distress_points = [m.intensity for m in last_7_days_moods]
    last_7_days_convs = [c for c in conversations if (today - c.updated_at).days <= 7]
    for c in last_7_days_convs:
        for msg in c.get_messages():
            if msg.get('role') == 'user':
                pass # We can use AI's distress level assessment
            elif msg.get('role') == 'ai' and 'distress_level' in msg:
                mapped_intensity = 1 + (msg['distress_level'] * 2.25)
                distress_points.append(mapped_intensity)
                
    if distress_points:
        # Give more weight to recent points by taking the average
        avg_distress = sum(distress_points) / len(distress_points)
        wellbeing_score = round(10.0 - (avg_distress * 0.8), 1)
        if wellbeing_score > 10.0: wellbeing_score = 10.0
        if wellbeing_score < 0.0: wellbeing_score = 0.0
        
    # Factor in recent assessment score
    latest_assessment = AssessmentResult.query.filter_by(user_id=user_id).order_by(AssessmentResult.created_at.desc()).first()
    if latest_assessment and (today - latest_assessment.created_at).days <= 30:
        # Score is 0-18. 0 = best (10/10), 18 = worst (0/10)
        assessment_wellbeing = max(0.0, 10.0 - (latest_assessment.score / 18.0 * 10.0))
        
        # Combine: Assessment is more formal, so give it 50% weight if available
        wellbeing_score = round((wellbeing_score * 0.5) + (assessment_wellbeing * 0.5), 1)
        
    # Calculate Current Streak
    active_dates = set()
    for m in moods: active_dates.add(m.created_at.date())
    for c in conversations: active_dates.add(c.updated_at.date())
    for j in JournalEntry.query.filter_by(user_id=user_id).all(): active_dates.add(j.created_at.date())
    
    active_dates_sorted = sorted(list(active_dates), reverse=True)
    current_streak = 0
    check_date = today.date()
    
    if check_date in active_dates_sorted:
        current_streak = 1
        active_dates_sorted.remove(check_date)
        check_date -= timedelta(days=1)
    elif check_date - timedelta(days=1) in active_dates_sorted:
        check_date -= timedelta(days=1)
        current_streak = 1
        active_dates_sorted.remove(check_date)
        check_date -= timedelta(days=1)
        
    for d in active_dates_sorted:
        if d == check_date:
            current_streak += 1
            check_date -= timedelta(days=1)
        else:
            break

    # Calculate Recent Activity
    recent_activity = []
    for m in MoodEntry.query.filter_by(user_id=user_id).order_by(MoodEntry.created_at.desc()).limit(3).all():
        recent_activity.append({'type': 'mood', 'text': f'Logged mood: {m.mood.capitalize()}', 'time': m.created_at})
    for j in JournalEntry.query.filter_by(user_id=user_id).order_by(JournalEntry.created_at.desc()).limit(3).all():
        recent_activity.append({'type': 'journal', 'text': f'Wrote journal entry{": " + j.title if j.title else ""}', 'time': j.created_at})
    for c in Conversation.query.filter_by(user_id=user_id).order_by(Conversation.updated_at.desc()).limit(3).all():
        recent_activity.append({'type': 'chat', 'text': 'Completed AI chat session', 'time': c.updated_at})
        
    recent_activity.sort(key=lambda x: x['time'], reverse=True)
    
    def format_relative_time(dt):
        diff = datetime.utcnow() - dt
        if diff.days > 0: return f"{diff.days} day{'s' if diff.days > 1 else ''} ago"
        hrs = diff.seconds // 3600
        if hrs > 0: return f"{hrs} hour{'s' if hrs > 1 else ''} ago"
        mins = diff.seconds // 60
        if mins > 0: return f"{mins} min{'s' if mins > 1 else ''} ago"
        return "Just now"

    for act in recent_activity:
        act['time'] = format_relative_time(act['time'])
    
    recent_activity = recent_activity[:5]

    return jsonify({
        'totalSessions': total_sessions,
        'averageMood': average_mood,
        'moodDistribution': mood_distribution,
        'weeklyTrend': weekly_trend,
        'weeklyTimeTrend': weekly_time_trend,
        'totalTimeSpent': total_time_spent,
        'currentStreak': current_streak,
        'wellbeingScore': wellbeing_score,
        'recentActivity': recent_activity
    })


# ============ CHAT ROUTES ============

@app.route('/api/chat', methods=['POST'])
@token_required
def chat(user_id):
    data = request.json
    user_message = data.get('message', '').strip()

    if not user_message:
        return jsonify({'error': 'Message is required'}), 400

    user = db.session.get(User, user_id)
    is_anonymous = user and user.email.startswith('anon_')

    # ── 1. Load / create conversation ────────────────────────────────────────
    conversation = None
    if is_anonymous:
        history = data.get('conversationHistory', [])
    else:
        conversation = Conversation.query.filter_by(user_id=user_id)\
            .order_by(Conversation.updated_at.desc()).first()
        from datetime import timedelta
        # Create a new conversation if none exists or if the last one is older than 1 hour
        if not conversation or (datetime.utcnow() - conversation.updated_at) > timedelta(hours=1):
            conversation = Conversation(user_id=user_id)
            conversation.set_messages([])
            db.session.add(conversation)
            db.session.commit() # Commit to get an ID just in case
        history = conversation.get_messages()

    # ── 2. Triage ─────────────────────────────────────────────────────────────
    emojis = triage_engine.extract_emojis(user_message)
    emoji_context = ''.join(emojis) if emojis else None
    severity, reason, intensity = triage_engine.analyze_severity(user_message, emoji_context)

    # Map intensity (1-10) → distress level (0-4)
    if intensity <= 2:   distress_level = 0
    elif intensity <= 4: distress_level = 1
    elif intensity <= 6: distress_level = 2
    elif intensity <= 8: distress_level = 3
    else:                distress_level = 4

    # ── 3. Mood detection ─────────────────────────────────────────────────────
    detected_mood, mood_confidence, _ = triage_engine.detect_mood(user_message, emoji_context)

    # Auto-save mood entry when confidence is sufficient
    if not is_anonymous and detected_mood and mood_confidence > 30:
        try:
            db.session.add(MoodEntry(user_id=user_id, mood=detected_mood, intensity=intensity))
        except Exception as e:
            print(f"[Mood save error] {e}")

    # ── 4. Escalation detection ───────────────────────────────────────────────
    is_escalating = False
    recent_user_msgs = [m for m in history if m.get('role') == 'user'][-3:]
    if len(recent_user_msgs) >= 2:
        past_intensities = []
        for m in recent_user_msgs:
            content = m.get('content') or m.get('text', '')
            _, _, past_i = triage_engine.analyze_severity(content)
            past_intensities.append(past_i)
        past_intensities.append(intensity)
        if len(past_intensities) >= 3:
            is_escalating = (
                past_intensities[-1] > past_intensities[-2] >= past_intensities[-3]
                or all(i >= 6 for i in past_intensities[-3:])
            )
        if is_escalating and severity != "RED":
            severity = "RED"
            intensity = max(intensity, 8)
            distress_level = max(distress_level, 3)

    # ── 5. Cultural Context & Mood Journey ────────────────────────────────────
    cultural_context = data.get('culturalContext', '')
    language = data.get('language', 'en-IN')
    
    past_moods_summary = ""
    if not is_anonymous:
        recent_moods = MoodEntry.query.filter_by(user_id=user_id).order_by(MoodEntry.created_at.desc()).limit(5).all()
        if recent_moods:
            past_moods_summary = ", ".join([f"{m.mood.capitalize()} ({m.intensity}/10)" for m in reversed(recent_moods)])

    # ── 6. Save user message ──────────────────────────────────────────────────
    if not is_anonymous and conversation:
        conversation.updated_at = datetime.utcnow()
        msg = Message(conversation_id=conversation.id, role='user', text=user_message)
        db.session.add(msg)

    # ── 7. Generate AI response via AI Engine ─────────────────────────────────
    # Extract age_group from user record (anonymous users have no age_group → generic)
    user_age_group = (user.age_group or "").strip() if user else ""

    ai_response = ai_generate_response(
        user_message=user_message,
        history=history,
        severity=severity,
        detected_mood=detected_mood,
        language=language,
        cultural_context=cultural_context,
        is_escalating=is_escalating,
        past_moods_summary=past_moods_summary,
        age_group=user_age_group,
    )

    # ── 8. Save AI message & commit ───────────────────────────────────────────
    if not is_anonymous and conversation:
        ai_msg = Message(
            conversation_id=conversation.id,
            role='ai',
            text=ai_response,
            triage_status=severity,
            distress_level=distress_level
        )
        db.session.add(ai_msg)
        db.session.commit()

    return jsonify({
        'response': ai_response,
        'triage_status': severity,
        'distress_level': distress_level,
        'intensity': intensity,
        'detected_emojis': emojis,
        'detected_mood': detected_mood,
        'mood_confidence': mood_confidence,
        'is_escalating': is_escalating,
        'timestamp': time.time(),
    })

# ============ MOOD TRACKING ROUTES ============

@app.route('/api/mood', methods=['POST'])
@token_required
def log_mood(user_id):
    data = request.json
    mood = data.get('mood')
    intensity = data.get('intensity', 5)
    notes = data.get('notes', '')
    sec_label = data.get('secondary_metric_label')
    sec_int = data.get('secondary_intensity')
    
    if not mood:
        return jsonify({'error': 'Mood is required'}), 400
        
    user = db.session.get(User, user_id)
    is_anonymous = user and user.email.startswith('anon_')
    
    if is_anonymous:
        # Return success for redirect flow but don't persist to DB
        return jsonify({
            'message': 'Anonymous mood logged successfully (ephemeral)', 
            'entry': {'mood': mood, 'intensity': intensity}
        }), 201
        
    try:
        entry = MoodEntry(
            user_id=user_id, 
            mood=mood, 
            intensity=intensity, 
            note=notes,
            secondary_metric_label=sec_label,
            secondary_intensity=sec_int
        )
        db.session.add(entry)
        db.session.commit()
        return jsonify({'message': 'Mood logged successfully', 'entry': entry.to_dict()}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/time_log', methods=['POST'])
@token_required
def log_time(user_id):
    data = request.json
    minutes = data.get('minutes', 1)
    
    user = db.session.get(User, user_id)
    if user and user.email.startswith('anon_'):
        return jsonify({'message': 'Anonymous, not logging time'}), 200
        
    try:
        entry = TimeLog(user_id=user_id, minutes=minutes)
        db.session.add(entry)
        db.session.commit()
        return jsonify({'message': 'Time logged'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- Routes ---

@app.route('/api/resources', methods=['GET'])
def get_mental_health_resources():
    state = request.args.get('state', 'National')
    data = get_resources_by_state(state)
    return jsonify(data), 200


@app.route('/api/user/update', methods=['PUT'])
@token_required
def update_user(current_user_id):
    data = request.json
    user = db.session.get(User, current_user_id)
    
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
                'messages': [m.to_dict() for m in conv.messages],
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
        'messages': [m.to_dict() for m in conversation.messages],
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

@app.route('/api/mood/history', methods=['GET'])
@token_required
def get_mood_history(user_id):
    limit = request.args.get('limit', type=int)
    offset = request.args.get('offset', default=0, type=int)
    
    query = MoodEntry.query.filter_by(user_id=user_id).order_by(MoodEntry.created_at.desc())
    if limit:
        query = query.limit(limit)
    if offset:
        query = query.offset(offset)
        
    moods = query.all()
    return jsonify({'moods': [mood.to_dict() for mood in moods]})

# ============ JOURNAL ROUTES ============

@app.route('/api/journal', methods=['GET'])
@token_required
def get_journal_entries(user_id):
    """Get all journal entries for the user"""
    try:
        entries = JournalEntry.query.filter_by(user_id=user_id)\
            .order_by(JournalEntry.created_at.desc()).all()
        return jsonify({'entries': [e.to_dict() for e in entries]}), 200
    except Exception as e:
        print(f"Error fetching journal entries: {e}")
        return jsonify({'error': 'Failed to fetch entries'}), 500


@app.route('/api/journal', methods=['POST'])
@token_required
def create_journal_entry(user_id):
    """Save journal entry with keyword-based mood + distress detection"""
    data = request.json

    if not data.get('content'):
        return jsonify({'error': 'Content is required'}), 400

    content = data['content']

    # 1. Detect mood from keywords in the journal text
    detected_mood, mood_confidence, mood_reason = triage_engine.detect_mood(content)
    mood_tag = data.get('mood_tag') or detected_mood or 'neutral'

    # 2. Analyze distress level → gives severity (RED/YELLOW/GREEN) + intensity (1-10)
    severity, distress_reason, distress_intensity = triage_engine.analyze_severity(content)

    # 3. Save journal entry
    entry = JournalEntry(
        user_id=user_id,
        title=data.get('title') or None,
        content=content,
        mood_tag=mood_tag
    )
    db.session.add(entry)

    # 4. Save MoodEntry with REAL distress-based intensity (not flat 5)
    mood_log = MoodEntry(
        user_id=user_id,
        mood=mood_tag,
        intensity=distress_intensity,          # e.g. 9 for RED, 6 for YELLOW, 3 for GREEN
        note=f'Journal: {distress_reason[:120]}' if distress_reason else 'Auto-detected from journal'
    )
    db.session.add(mood_log)
    db.session.commit()

    print(f"✅ Journal saved | user={user_id} | mood={mood_tag} | severity={severity} | intensity={distress_intensity}")
    return jsonify({
        'message': 'Journal entry saved',
        'entry': entry.to_dict(),
        'detected_mood': mood_tag,
        'severity': severity,
        'distress_intensity': distress_intensity,
        'mood_reason': mood_reason
    }), 201


@app.route('/api/journal/<int:entry_id>', methods=['PUT'])
@token_required
def update_journal_entry(user_id, entry_id):
    """Update a journal entry's title and content"""
    data = request.json
    try:
        entry = JournalEntry.query.filter_by(id=entry_id, user_id=user_id).first()
        if not entry:
            return jsonify({'error': 'Entry not found'}), 404
            
        if 'content' in data and data['content']:
            entry.content = data['content']
        if 'title' in data:
            entry.title = data['title'] or None
            
        db.session.commit()
        return jsonify({
            'message': 'Entry updated',
            'entry': entry.to_dict()
        }), 200
    except Exception as e:
        print(f"Error updating entry: {e}")
        db.session.rollback()
        return jsonify({'error': 'Failed to update entry'}), 500

@app.route('/api/journal/<int:entry_id>', methods=['DELETE'])
@token_required
def delete_journal_entry(user_id, entry_id):
    """Delete a journal entry"""
    try:
        entry = JournalEntry.query.filter_by(id=entry_id, user_id=user_id).first()
        if not entry:
            return jsonify({'error': 'Entry not found'}), 404
        db.session.delete(entry)
        db.session.commit()
        return jsonify({'message': 'Entry deleted'}), 200
    except Exception as e:
        print(f"Error deleting entry: {e}")
        db.session.rollback()
        return jsonify({'error': 'Failed to delete entry'}), 500

@app.route('/api/admin/insights', methods=['GET'])
@token_required
def get_admin_insights(user_id):
    total_users = User.query.count()
    total_conversations = Conversation.query.count()
    
    from datetime import datetime, date
    today = datetime.utcnow().date()
    # Simple active today count (distinct users who logged a mood today)
    from sqlalchemy import func
    active_today = db.session.query(MoodEntry.user_id).filter(func.date(MoodEntry.created_at) == today).distinct().count()
    
    distress_counts = [
        {"level": "Low", "count": 0, "color": "bg-success-base"},
        {"level": "Moderate", "count": 0, "color": "bg-warning-base"},
        {"level": "High", "count": 0, "color": "bg-danger-base"}
    ]
    
    moods = MoodEntry.query.all()
    mood_breakdown = {}
    
    for m in moods:
        if m.intensity >= 8:
            distress_counts[2]["count"] += 1
        elif m.intensity >= 4:
            distress_counts[1]["count"] += 1
        else:
            distress_counts[0]["count"] += 1
            
        mood_breakdown[m.mood] = mood_breakdown.get(m.mood, 0) + 1

    top_moods = sorted([{"mood": k.capitalize(), "count": v} for k, v in mood_breakdown.items()], key=lambda x: x["count"], reverse=True)[:5]

    total_minutes = db.session.query(func.sum(TimeLog.minutes)).scalar() or 0
    
    if total_conversations > 0:
        avg_session_minutes = int(total_minutes / total_conversations)
    else:
        avg_session_minutes = 0
        
    avg_session_str = f"{avg_session_minutes} min"

    return jsonify({
        "totalUsers": total_users,
        "activeToday": active_today,
        "totalSessions": total_conversations,
        "averageSessionLength": avg_session_str,
        "distressDistribution": distress_counts,
        "topMoods": top_moods
    })

# ============ ADMIN/DEBUG ROUTES ============

@app.route('/api/admin/data', methods=['GET'])
@token_required
def view_all_data(user_id):
    """Simple endpoint to view all stored data (for development/debugging)"""
    users = User.query.all()
    conversations = Conversation.query.all()
    moods = MoodEntry.query.all()
    return jsonify({
        'users': [{'id': u.id, 'name': u.name, 'email': u.email, 'created_at': u.created_at.isoformat()} for u in users],
        'conversations': [{'id': c.id, 'user_id': c.user_id, 'message_count': len(c.get_messages()), 'last_updated': c.updated_at.isoformat()} for c in conversations],
        'mood_entries': [m.to_dict() for m in moods],
        'total_users': len(users),
        'total_conversations': len(conversations),
        'total_moods': len(moods)
    })

# ============ BACKGROUND CLEANUP TASK ============
import threading
import time
from datetime import datetime, timedelta

def cleanup_anonymous_users():
    """Background task to delete anonymous users older than 24 hours."""
    while True:
        try:
            with app.app_context():
                cutoff_time = datetime.utcnow() - timedelta(hours=24)
                # Query all users with email starting with 'anon_' created before cutoff
                old_anons = User.query.filter(
                    User.email.like('anon_%'),
                    User.created_at < cutoff_time
                ).all()
                
                if old_anons:
                    count = len(old_anons)
                    for anon in old_anons:
                        db.session.delete(anon)
                    db.session.commit()
                    print(f"[Cleanup] Deleted {count} expired anonymous accounts.")
        except Exception as e:
            print(f"[Cleanup Error] {e}")
            
        # Run cleanup every hour (3600 seconds)
        time.sleep(3600)

# Start the background thread when the app initializes
cleanup_thread = threading.Thread(target=cleanup_anonymous_users, daemon=True)
cleanup_thread.start()


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
