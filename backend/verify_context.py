import sys
from services.session import SessionManager

def test_context_injection():
    print("--- Starting Context Injection Verification ---")
    
    manager = SessionManager()
    
    # 1. Create Session with "Space" interest
    print("Creating Session with interest: ['space']")
    session_id = manager.create_session(domain="school_math", interests=["space"])
    
    # Force the Mock generator to pick a relevant template (integers/distance)
    # The mock uses random choice, so we might need a couple of tries if random picks the wrong template
    # But for "integers" we have 2 templates. 
    # Let's override knowledge state to ensure it picks 'integers' or 'geometry'
    # Actually, default starts at root, so it might pick integers.
    
    found_context = False
    
    for i in range(5):
        print(f"Attempt {i+1}...")
        res = manager.get_next_question(session_id)
        if not res: continue
        
        q_text = res['question']['question']
        print(f"Generated: {q_text}")
        
        if "SpaceX" in q_text or "Rocket" in q_text:
            print("SUCCESS: Found Space context in question.")
            found_context = True
            break
            
        # Mocking logic check: if we hit the 'distance' template, it MUST have space context.
        # If we hit 'solve for x', it won't. So 5 attempts is plenty.
        
    if not found_context:
        print("FAIL: Did not generate a space-themed question after 5 attempts.")
        sys.exit(1)

    print("--- Test Passed ---")

if __name__ == "__main__":
    test_context_injection()
