import traceback

def run_gemini_call_test():
    try:
        from app import app
        # generate_gemini_response was replaced by openrouter/groq engine
        try:
            from app import generate_gemini_response
        except ImportError:
            print("[INFO] generate_gemini_response is deprecated. Backend uses Groq AI engine.")
            return

        history = [
            {"role": "user", "text": "I feel stressed"},
            {"role": "ai", "text": "I hear you, it's okay."},
            {"role": "user", "text": "But it's getting worse."}
        ]

        with app.app_context():
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
        traceback.print_exc()

if __name__ == "__main__":
    run_gemini_call_test()
