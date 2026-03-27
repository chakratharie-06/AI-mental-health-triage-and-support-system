from app import generate_gemini_response, app

# Mock conversation history
history = [
    {"role": "user", "text": "I feel stressed"},
    {"role": "ai", "text": "I hear you, it's okay."},
    {"role": "user", "text": "But it's getting worse."}
]

with app.app_context():
    try:
        response = generate_gemini_response(
            user_message="Now I feel completely overwhelmed.",
            severity="RED",
            intensity=9,
            conversation_history=history,
            detected_mood="sad",
            target_lang="en"
        )
        print("Success:", response)
    except Exception as e:
        print("Crash Traceback:")
        import traceback
        traceback.print_exc()
