import os
from dotenv import load_dotenv

def run_gemini2_test():
    load_dotenv()
    api_key = os.getenv('GEMINI_API_KEY')

    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents='Hello'
        )
        with open('gemini_error.txt', 'w', encoding='utf-8') as f:
            f.write("Success")
    except ImportError as e:
        with open('gemini_error.txt', 'w', encoding='utf-8') as f:
            f.write("google-genai package not installed")
    except Exception as e:
        with open('gemini_error.txt', 'w', encoding='utf-8') as f:
            f.write(str(e))

if __name__ == "__main__":
    run_gemini2_test()
