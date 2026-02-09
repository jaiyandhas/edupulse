import sys
import traceback
from services.llm_service import MockLLMService

def debug_llm():
    print("--- Starting LLM Service Stress Test ---")
    service = MockLLMService()
    
    domains = ["dsa", "school_math"]
    
    try:
        for domain in domains:
            print(f"\nTesting Domain: {domain}")
            # Generate 20 questions to hit all templates
            for i in range(20):
                try:
                    q = service.generate_question(domain, 1, interests=["cars"])
                    print(f"[{i+1}] {q['question'][:50]}... | Options: {len(q['options'])}")
                    
                    # Verify structure
                    if len(q['options']) != 4:
                        print("ERROR: Incorrect number of options")
                        
                    if not q['id'].startswith("gen_"):
                         print("ERROR: ID format wrong")
                         
                except Exception as e:
                    print(f"CRASH generating question for {domain}: {e}")
                    traceback.print_exc()
                    sys.exit(1)
                    
        print("\n--- Test Passed: No Crashes Detected ---")
        
    except Exception as e:
        print(f"Global Crash: {e}")
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    debug_llm()
