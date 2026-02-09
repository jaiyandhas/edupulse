import json
import numpy as np
from typing import List, Dict

class RLTrainingService:
    """
    Service responsible for Offline Training of the RL Policy Network.
    This demonstrates 'How it is trained' for technical auditing.
    """
    
    def __init__(self, data_path: str = "backend/data/rl_experience_replay.json"):
        self.data_path = data_path
        self.q_table = {} # Mock Q-Table (State-Action -> Value)
        self.learning_rate = 0.1
        self.discount_factor = 0.95 # Gamma

    def load_experience_replay(self) -> List[Dict]:
        """Loads historical interaction logs (The Dataset)"""
        try:
            with open(self.data_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return []

    def train_epoch(self):
        """
        Executes one epoch of Q-Learning updates based on the Bellman Equation:
        Q(s,a) = Q(s,a) + alpha * [R + gamma * max(Q(s', a')) - Q(s,a)]
        """
        dataset = self.load_experience_replay()
        print(f"Training on {len(dataset)} experience tuples...")
        
        for experience in dataset:
            state_key = self._hash_state(experience['state'])
            action_key = experience['action']['type']
            reward = experience['reward']
            next_state_key = self._hash_state(experience['next_state'])
            
            # 1. Get current Q-Value
            current_q = self.q_table.get((state_key, action_key), 0.0)
            
            # 2. Estimate Max Future Reward (Bootstrapping)
            # (In a real Deep Q-Network, this would require a forward pass of the Target Network)
            max_future_q = self._get_max_q(next_state_key)
            
            # 3. Apply Bellman Update
            new_q = current_q + self.learning_rate * (
                reward + self.discount_factor * max_future_q - current_q
            )
            
            # 4. Update Policy
            self.q_table[(state_key, action_key)] = new_q
            
            print(f"Updated Q({state_key[:5]}..., {action_key}) -> {new_q:.4f}")

    def _hash_state(self, state: Dict) -> str:
        """Simplistic state hashing for tabular Q-Learning"""
        # In production, this is a Vector Embedding (BERT/tensor)
        mastery = sum(state['concept_mastery'].values()) / len(state['concept_mastery'])
        emotion = np.argmax(state['emotion_vector']) # 0=Frustrated, 1=Engaged...
        return f"M:{mastery:.1f}_E:{emotion}"

    def _get_max_q(self, state_key: str) -> float:
        """Finds max Q-value for a given state across all possible actions"""
        possible_actions = ["serve_content", "recommend_next_topic", "remediate"]
        q_values = [self.q_table.get((state_key, a), 0.0) for a in possible_actions]
        return max(q_values)

if __name__ == "__main__":
    trainer = RLTrainingService()
    trainer.train_epoch()
