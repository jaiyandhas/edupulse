from google import genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("No API Key")
    exit(1)

client = genai.Client(api_key=api_key)

print("Testing gemini-2.5-flash...")
try:
    response = client.models.generate_content(
        model='gemini-2.5-flash', contents='Hello'
    )
    print("SUCCESS: gemini-2.5-flash works.")
    print(response.text)
except Exception as e:
    print(f"FAIL: gemini-1.5-flash failed: {e}")
