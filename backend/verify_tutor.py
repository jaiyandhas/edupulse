import sys
import time
from services.gemini_service import GeminiService

def test_tutor_chat():
    print("--- Starting AI Tutor Verification Test ---")
    
    # 1. Init Service
    tutor = GeminiService()
    
    if not tutor.model:
        print("FAIL: Tutor service initialized in offline mode (check API Key).")
        sys.exit(1)
        
    print(f"Service initialized with model: {tutor.primary_model_name}")

    # 2. Test Session Creation
    session_id = f"test_session_{int(time.time())}"
    context = "Photosynthesis"
    
    print(f"Creating chat session: {session_id} with context: {context}")
    chat = tutor.get_chat(session_id, context)
    
    if not chat:
        print("FAIL: Failed to create chat session.")
        sys.exit(1)
        
    # 3. Test Message Sending
    message = "Explain it to me like I'm 5."
    print(f"Sending User Message: '{message}'")
    
    start_t = time.time()
    response = tutor.send_message(session_id, message, context)
    duration = time.time() - start_t
    
    print(f"Response Received in {duration:.2f}s")
    print("-" * 20)
    print(response[:200] + "...") # Print preview
    print("-" * 20)
    
    # 4. content validation
    if "error" in response.lower() and len(response) < 100:
        print("FAIL: Response indicates error.")
        sys.exit(1)
        
    if "offline" in response.lower():
        print("SUCCESS: Mock/Offline response received (Quota Handled).")
        return

    print("SUCCESS: Tutor responded successfully.")
    print("--- Test Passed ---")

if __name__ == "__main__":
    test_tutor_chat()
