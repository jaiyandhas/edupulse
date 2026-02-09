
import os
import sys

# Add backend to path so we can import services
sys.path.append(os.path.join(os.getcwd(), 'backend'))

try:
    from services.gemini_service import GeminiService
except ImportError:
    # Try importing as backend.services if the above fails
    try:
        from backend.services.gemini_service import GeminiService
    except ImportError as e:
        print(f"Import Error: {e}")
        sys.exit(1)

def test_gemini_connection():
    print("Testing Gemini Service Connection...")
    try:
        service = GeminiService()
        if not service.model:
            print("Service initialized but offline (no model).")
        else:
            print(f"Service initialized. API Key: {service.api_key[:5]}...{service.api_key[-5:] if service.api_key else ''}")
        
        response = service.send_message("test_session", "Hello, are you working?", context="Diagnostics")
        print(f"Response: {response}")
    except Exception as e:
        print(f"Error during execution: {str(e)[:200]}...")

if __name__ == "__main__":
    test_gemini_connection()
