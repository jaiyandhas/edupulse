import os
from services.gemini_service import GeminiService
from dotenv import load_dotenv

load_dotenv()

def test_gemini():
    print("--- Testing Gemini Service ---")
    try:
        service = GeminiService()
        print("Service initialized.")
        
        session_id = "test_session_123"
        print("Sending message...")
        response = service.send_message(session_id, "Explain the concept of Binary Search in one sentence.", context="Binary Search")
        
        print(f"\nResponse received:\n{response}")
        
        # Verify it's not an error message
        if "Error" in response:
            print("FAIL: Service returned an error string.")
        else:
            print("SUCCESS: API is working.")
            
    except Exception as e:
        print(f"CRASH: {e}")

if __name__ == "__main__":
    test_gemini()
