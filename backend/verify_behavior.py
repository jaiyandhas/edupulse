import sys
from services.session import SessionManager

def test_behavioral_signals():
    print("--- Starting Behavioral Analysis Verification ---")
    
    manager = SessionManager()
    session_id = manager.create_session(domain="dsa")
    session = manager.sessions[session_id]
    
    # Needs an active question to submit against
    # Just inject one manually
    q_mock = {
        "id": "mock_sys_1", 
        "question": "Q", 
        "correct_answer": "A", 
        "options": ["A"], 
        "difficulty": 1,
        "concept": "arrays"
    }
    session['active_question'] = q_mock
    
    # 1. Test Rage Clicks -> Frustrated
    print("Simulating Rage Clicks (e.g. user clicking wildly)...")
    res = manager.submit_answer(
        session_id, 
        q_mock['id'], 
        "Wrong Answer", # Incorrect
        time_taken=10.0, # Normal time (would usually be 'Stable' or normal error)
        telemetry={
            "rageClicks": 5, # High signal
            "tabSwitches": 0
        }
    )
    
    emotion = res['rl_data']['state_vector'][1]
    print(f"Detected Emotion: {emotion}")
    
    if emotion != "Frustrated":
        print(f"FAIL: Expected Frustrated due to rage clicks, got {emotion}")
        sys.exit(1)
    else:
        print("SUCCESS: Rage clicks correctly triggered Frustration.")

    # 2. Test Tab Switches -> Bored
    print("Simulating Tab Switching (Distraction)...")
    res = manager.submit_answer(
        session_id, 
        q_mock['id'], 
        "A", # Correct
        time_taken=15.0, # Normal time (would usually be 'Engaged')
        telemetry={
            "rageClicks": 0, 
            "tabSwitches": 2 # High signal
        }
    )
    
    emotion = res['rl_data']['state_vector'][1]
    print(f"Detected Emotion: {emotion}")
    
    if emotion != "Bored":
        print(f"FAIL: Expected Bored due to tab switches, got {emotion}")
        sys.exit(1)
    else:
        print("SUCCESS: Tab switching correctly triggered Boredom.")

    print("--- Test Passed ---")

if __name__ == "__main__":
    test_behavioral_signals()
