import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("No API Key")
    exit(1)

genai.configure(api_key=api_key)

print("Testing gemini-1.5-flash...")
try:
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content("Hello")
    print("SUCCESS: gemini-1.5-flash works.")
    print(response.text)
except Exception as e:
    print(f"FAIL: gemini-1.5-flash failed: {e}")
