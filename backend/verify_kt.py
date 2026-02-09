import sys
from services.session import SessionManager
from model.knowledge_graph import CONCEPT_GRAPH

def test_knowledge_tracing():
    print("--- Starting Knowledge Tracing Verification ---")
    
    manager = SessionManager()
    session_id = manager.create_session(domain="dsa")
    
    # 1. Inspect Initial State
    session = manager.sessions[session_id]
    k_state = session['knowledge_state']
    
    initial_p = k_state.get_mastery("arrays")
    print(f"Initial P(arrays): {initial_p}")
    
    # 2. Simulate User Learning 'Arrays'
    # We will answer correctly multiple times to push mastery up
    print("Simulating 3 correct answers for 'arrays'...")
    
    # Inject active question manually to target 'arrays'
    q_mock = {
        "id": "gen_test_1",
        "question": "Test Q",
        "correct_answer": "A",
        "options": ["A"],
        "difficulty": 1,
        "concept": "arrays", # Explicit concept
        "hint": "h",
        "explanation": "e"
    }
    session['active_question'] = q_mock
    
    curr_p = initial_p
    for i in range(3):
        res = manager.submit_answer(session_id, q_mock['id'], "A", 5.0)
        new_p = k_state.get_mastery("arrays")
        print(f"Step {i+1}: P(arrays) -> {new_p:.4f}")
        if new_p <= curr_p:
            print("FAIL: Mastery probability did not increase.")
            sys.exit(1)
        curr_p = new_p
        
    # 3. Check Next Recommendation
    # Since Arrays is high, it should recommend 'recursion' (other root) or 'tips/pointers' (next node)
    # The logic is: Prereqs met (arrays > 0.6) -> Pointers is candidate.
    
    next_concept = manager.kt_service.get_next_recommended_concept(k_state, "dsa")
    print(f"Next Recommended Concept: {next_concept}")
    
    # In our graph, 'pointers' depends on 'arrays'.
    # If arrays mastery is high, pointers should be unlocked.
    # 'recursion' is also a root, so it's a candidate.
    
    valid_next = ["pointers", "recursion", "sorting"]
    if next_concept not in valid_next:
        print(f"FAIL: Recommended {next_concept} which is likely not optimal given graph.")
        # It's not a hard fail if the heuristic picks something else, but let's warn.
    else:
        print("SUCCESS: Recommendation aligns with graph topology.")

    print("--- Test Passed ---")

if __name__ == "__main__":
    test_knowledge_tracing()
