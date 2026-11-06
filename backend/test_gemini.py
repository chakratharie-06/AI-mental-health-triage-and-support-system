import os
from dotenv import load_dotenv

def run_gemini_test():
    load_dotenv()
    api_key = os.getenv('GEMINI_API_KEY')
    print(f"API Key present: {bool(api_key)}")

    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents='Hello, respond with a short test message.'
        )
        print("Success! AI Response:", response.text)
    except ImportError:
        print("google-genai package not installed.")
    except Exception as e:
        print(f"Gemini API Error: {type(e).__name__} - {e}")

if __name__ == "__main__":
    run_gemini_test()
