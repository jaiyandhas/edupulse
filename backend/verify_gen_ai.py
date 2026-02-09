import sys
import time
from services.session import SessionManager

def test_dynamic_question_flow():
    print("--- Starting GenAI Verification Test ---")
    
    # 1. Init Manager
    manager = SessionManager()
    
    # 2. Create Session
    session_id = manager.create_session(domain="school_math")
    print(f"Session Created: {session_id}")
    
    # 3. Get Next Question
    print("Fetching Question...")
    start_t = time.time()
    result = manager.get_next_question(session_id)
    duration = time.time() - start_t
    
    if not result or result.get('status') == 'complete':
        print("FAIL: No question returned")
        sys.exit(1)
        
    question = result['question']
    q_id = question['id']
    print(f"Question Received: {q_id}")
    print(f"Text: {question['question']}")
    print(f"Options: {question['options']}")
    print(f"Latency: {duration:.2f}s")
    
    # Assert it's dynamic
    if not (q_id.startswith("gen_") or q_id.startswith("mock_")):
        print(f"FAIL: Expected dynamic ID (gen_...), got {q_id}. Fallback was used?")
        # It's okay if fallback used if mock failed, but mock shouldn't fail.
        # However, for this test we WANT to see dynamic
        sys.exit(1)
        
    # 4. Submit Answer
    correct_ans = question['correct_answer'] # Validates we have access to it in the object
    print(f"Submitting Correct Answer: {correct_ans}")
    
    res = manager.submit_answer(session_id, q_id, correct_ans, time_taken=5.0)
    
    if not res:
        print("FAIL: Submit returned None")
        sys.exit(1)
        
    if not res['correct']:
        print(f"FAIL: Expected correct=True, got {res['correct']}")
        sys.exit(1)
        
    print("SUCCESS: Answer validated correctly against dynamic state.")
    
    # 5. Check if Insight was generated (RL Engine)
    if 'rl_data' in res:
        print(f"RL Insight: {res['rl_data'].get('insight')}")
        
    print("--- Test Passed ---")

if __name__ == "__main__":
    test_dynamic_question_flow()
