import random

# Shim Class to replace Numpy
class SimpleArray:
    def __init__(self, data):
        self.data = data
        
    def __getitem__(self, key):
        return self.data[key]
        
    def __setitem__(self, key, value):
        self.data[key] = value

class NumpyShim:
    def zeros(self, shape):
        # Create 4D array: [d1][d2][d3][d4]
        d1, d2, d3, d4 = shape
        return [[[[0.0 for _ in range(d4)] for _ in range(d3)] for _ in range(d2)] for _ in range(d1)]

    def argmax(self, array_1d):
        return array_1d.index(max(array_1d))
        
    def max(self, array_1d):
        return max(array_1d)

np = NumpyShim() # Mock instance

class RLEngine:
    def __init__(self):
        # Q-Table Structure
        # Dimensions: [MasteryLevel(3)][Emotion(5)][LastDiff(3)] x [Actions(3)]
        # Emotion now has 5 states (0: Engaged, 1: Bored, 2: Frustrated, 3: Stable, 4: Flow)
        self.q_table = np.zeros((3, 5, 3, 3)) 
        
        # Hyperparameters
        self.alpha = 0.1  # Learning Rate
        self.gamma = 0.9  # Discount Factor
        self.epsilon = 0.1 # REDUCED Exploration (was 0.2) to feel less "random"

    def get_state_index(self, mastery_score, emotion_idx, current_difficulty):
        # Mastery: 0-33% -> 0, 34-66% -> 1, 67-100% -> 2
        m_idx = 0
        if mastery_score > 0.66: m_idx = 2
        elif mastery_score > 0.33: m_idx = 1
        
        # Difficulty: 1 -> 0, 2 -> 1, 3 -> 2
        d_idx = max(0, min(2, current_difficulty - 1))
        
        # Safety for unexpected emotion content
        e_idx = emotion_idx if emotion_idx < 5 else 3

        return (m_idx, e_idx, d_idx)

    def choose_action(self, state_idx):
        if random.uniform(0, 1) < self.epsilon:
            return random.choice([0, 1, 2]) # Explore
        else:
            m, e, d = state_idx
            return np.argmax(self.q_table[m][e][d]) # Exploit

    def update(self, state_idx, action, reward, next_state_idx):
        m, e, d = state_idx
        nm, ne, nd = next_state_idx
        
        old_value = self.q_table[m][e][d][action]
        next_max = np.max(self.q_table[nm][ne][nd])
        
        new_value = (1 - self.alpha) * old_value + self.alpha * (reward + self.gamma * next_max)
        self.q_table[m][e][d][action] = new_value
        return new_value

    def calculate_reward(self, is_correct, time_taken, emotion_state, difficulty):
        # Dual-Objective Optimization: 
        # 1. Efficiency (Mastery + Speed)
        # 2. Engagement (Flow State Stability)
        
        # --- Efficiency Component ---
        efficiency_score = 0
        if is_correct:
            efficiency_score += 1.0
            # Speed bonus for correct answers
            if time_taken < 20: efficiency_score += 0.5
            if difficulty == 3: efficiency_score += 0.5 # Bonus for hard problems
        else:
            efficiency_score -= 1.0
            
        # --- Engagement Component ---
        engagement_score = 0
        if emotion_state == "Flow":
            engagement_score += 2.0
        elif emotion_state == "Engaged":
            engagement_score += 1.0
        elif emotion_state == "Bored":
            engagement_score -= 1.0 # Boredom means too easy
        elif emotion_state == "Frustrated":
            engagement_score -= 2.0 # Frustration means too hard
        
        # Weighted Total Reward
        # We prioritize engagement slightly less than mastery, but enough to steer the policy
        total_reward = (0.6 * efficiency_score) + (0.4 * engagement_score)
        
        return {
            "total": total_reward,
            "efficiency": efficiency_score,
            "engagement": engagement_score
        }

    def generate_insight(self, action, emotion, difficulty):
        # 0: Decrease, 1: Maintain, 2: Increase
        
        if action == 2: # Increase
            if emotion in ["Flow", "Engaged"]:
                return "User is in Flow/Engaged state. Increasing challenge to maintain optimal learning velocity."
            return "High performance detected. Increasing difficulty to prevent boredom."
            
        if action == 0: # Decrease
            if emotion == "Frustrated":
                return "Frustration detected. Lowering difficulty to restore confidence and engagement."
            return "Performance dip detected. Reducing complexity to reinforce fundamentals."
            
        # Maintain
        if emotion == "Flow":
            return "User is in Flow. maintaining current difficulty to sustain state."
        return "Current difficulty level matches user capabilities. Maintaining stability."

    def step(self, context):
        """
        Executes a full RL step:
        1. Encodes current state (Mastery, Emotion, Diff)
        2. Calculates Reward for PREVIOUS action
        3. Updates Q-Table (Learning)
        4. Chooses NEXT action
        5. Generates Insight
        """
        # Context Extraction
        mastery = context['mastery']
        emotion = context['emotion']
        emotion_idx = context['emotion_idx']
        curr_diff = context['current_difficulty']
        
        is_correct = context['is_correct']
        time_taken = context['time_taken']
        q_difficulty = context['q_difficulty']
        
        prev_state_idx = context.get('prev_state_idx')
        prev_action_idx = context.get('prev_action_idx')
        
        # 1. Current State
        current_state_idx = self.get_state_index(mastery, emotion_idx, curr_diff)
        
        # 2. Reward Calculation
        reward_data = self.calculate_reward(is_correct, time_taken, emotion, q_difficulty)
        reward = reward_data['total']
        
        # 3. Learning (Update previous state-action value)
        if prev_state_idx is not None and prev_action_idx is not None:
             self.update(prev_state_idx, prev_action_idx, reward, current_state_idx)
             
        # 4. Action Selection
        action_idx = self.choose_action(current_state_idx)
        action_str = ["Decrease Difficulty", "Maintain Difficulty", "Increase Difficulty"][action_idx]
        
        # 5. Insight
        insight = self.generate_insight(action_idx, emotion, q_difficulty)
        
        # Difficulty Delta
        diff_change = self.map_action_to_difficulty_change(action_idx)
        
        return {
            "action_idx": action_idx,
            "action": action_str,
            "diff_change": diff_change,
            "reward": reward,
            "metrics": reward_data,
            "insight": insight,
            "state_snapshot": current_state_idx
        }

    def map_action_to_difficulty_change(self, action):
        # 0: Decrease, 1: Maintain, 2: Increase
        if action == 0: return -1
        if action == 1: return 0
        if action == 2: return 1
        return 0
