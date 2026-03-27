import os
from dotenv import load_dotenv
from google import genai

load_dotenv()
api_key = os.getenv('GEMINI_API_KEY')

try:
    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model='gemini-2.0-flash',
        contents='Hello'
    )
    with open('gemini_error.txt', 'w', encoding='utf-8') as f:
        f.write("Success")
except Exception as e:
    with open('gemini_error.txt', 'w', encoding='utf-8') as f:
        f.write(str(e))
