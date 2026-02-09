
import requests
import json

BASE_URL = "http://localhost:8000"

def debug_session_422():
    url = f"{BASE_URL}/api/session/start"
    
    # 1. Payload mimicking Frontend (with potential undefined/null issues)
    # Frontend sends: { domain: ..., user_id: user?.id, mode: ..., focus_concept: ... }
    # Case A: user_id is None (should work)
    payload_a = {
        "domain": "dsa",
        "user_id": None,
        "mode": "standard",
        "focus_concept": None
    }
    
    print("\n--- Testing Payload A (Standard) ---")
    try:
        res = requests.post(url, json=payload_a)
        print(f"Status: {res.status_code}")
        if res.status_code == 422:
            print("Response:", json.dumps(res.json(), indent=2))
        else:
            print("Success:", res.json())
    except Exception as e:
        print(f"Error: {e}")

    # Case B: user_id is missing (should work if Optional)
    payload_b = {
        "domain": "dsa",
        "mode": "standard"
    }
    print("\n--- Testing Payload B (Missing Optional Fields) ---")
    try:
        res = requests.post(url, json=payload_b)
        print(f"Status: {res.status_code}")
        if res.status_code == 422:
             print("Response:", json.dumps(res.json(), indent=2))
    except Exception as e:
        print(f"Error: {e}")

    # Case C: Validating if 'interests' is required (It defaults to [])
    payload_c = {
        "domain": "dsa",
        "interests": None # This might fail if list[str] doesn't allow None
    }
    print("\n--- Testing Payload C (Interests=None) ---")
    try:
        res = requests.post(url, json=payload_c)
        print(f"Status: {res.status_code}")
        if res.status_code == 422:
            print("Response (Expected 422 potentially):", json.dumps(res.json(), indent=2))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    debug_session_422()
