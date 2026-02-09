
import unittest
from services.session import SessionManager
from services.llm_service import get_llm_service

class TestAdaptiveLoop(unittest.TestCase):
    def setUp(self):
        self.manager = SessionManager()
        self.session_id = self.manager.create_session(domain="dsa", focus_concept="arrays")
        self.llm = get_llm_service()

    def test_mastery_advance(self):
        print("\nTesting Mastery Advance (Arrays -> Linked Lists)...")
        # Simulate 3 correct answers for "arrays"
        # We need to manually inject history or mock the question data retrieval
        # validation inside submit_answer relies on active_question or QUESTION_BANK.
        # For simplicity, we'll mock the internal state update or use a mock question.
        
        # 1. Get a question
        q_res = self.manager.get_next_question(self.session_id)
        q = q_res['question']
        # Force concept to 'arrays' and difficulty to 3 to trigger mastery check
        q['concept'] = 'arrays'
        q['difficulty'] = 3 
        self.manager.sessions[self.session_id]['active_question'] = q
        self.manager.sessions[self.session_id]['current_difficulty'] = 3
        
        # 2. Submit Correct Answer 3 times (Simulating history)
        # We need to hack history to simulate previous 2 correct answers
        self.manager.sessions[self.session_id]['history'] = [
            {'question_id': 'mock1', 'is_correct': True, 'difficulty': 3, 'time_taken': 10},
            {'question_id': 'mock2', 'is_correct': True, 'difficulty': 3, 'time_taken': 10}
        ]
        
        # 3. Submit 3rd Correct Answer
        res = self.manager.submit_answer(
            self.session_id, 
            q['id'], 
            q['correct_answer'], 
            10
        )
        
        print("Result:", res.get('next_action'))
        self.assertIsNotNone(res.get('next_action'))
        self.assertEqual(res['next_action']['type'], 'mastery_advance')
        self.assertEqual(res['next_action']['next_concept'], 'linked_lists')

    def test_remediation(self):
        print("\nTesting Remediation (Arrays -> Foundations)...")
        q_res = self.manager.get_next_question(self.session_id)
        q = q_res['question']
        q['concept'] = 'arrays'
        q['difficulty'] = 1
        self.manager.sessions[self.session_id]['active_question'] = q
        
        # Simulate 2 failures
        self.manager.sessions[self.session_id]['history'] = [
            {'question_id': 'mock1', 'is_correct': False, 'difficulty': 1, 'time_taken': 10},
            {'question_id': 'mock2', 'is_correct': False, 'difficulty': 1, 'time_taken': 10}
        ]
        
        # Submit 3rd Failure
        res = self.manager.submit_answer(
            self.session_id, 
            q['id'], 
            "WRONG ANSWER", 
            10
        )
        
        print("Result:", res.get('next_action'))
        self.assertIsNotNone(res.get('next_action'))
        self.assertEqual(res['next_action']['type'], 'remediate')

if __name__ == '__main__':
    unittest.main()
