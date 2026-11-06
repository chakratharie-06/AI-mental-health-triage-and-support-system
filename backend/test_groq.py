import os
import traceback
from dotenv import load_dotenv

def run_groq_test():
    # load environment variables
    load_dotenv()

    # test the module
    try:
        from openrouter_engine import generate_response
        print("Testing generate_response with Groq API...")
        history = [
            {"role": "user", "content": "Hi, I am feeling a bit stressed today."}
        ]
        response = generate_response(
            user_message="I have an exam coming up and I am so nervous.",
            history=history,
            severity="GREEN",
            detected_mood="anxious",
            language="en-IN",
            cultural_context="Academic Pressure"
        )
        with open("test_result.txt", "w", encoding="utf-8") as f:
            f.write("[SUCCESS] Response received from Groq:\n")
            f.write("-" * 50 + "\n")
            f.write(response + "\n")
            f.write("-" * 50 + "\n")
        print("Response received successfully!")
    except Exception as e:
        with open("test_result.txt", "w", encoding="utf-8") as f:
            f.write(f"[ERROR] Failed to generate response: {e}\n")
            f.write(traceback.format_exc())
        print(f"Error: {e}")

if __name__ == "__main__":
    run_groq_test()
