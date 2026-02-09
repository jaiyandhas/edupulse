# EduPulse Model Architecture: Deep Dive

This document provides a line-by-line technical breakdown of the core AI components for the M.I.T. panel presentation.

---

## 1. `backend/model/rl_engine.py` (The "Brain")

This file implements a **Tabular Q-Learning Agent** designed to optimize the student's learning path.

### **Lines 1-27: The Environment Shim**
We implement a lightweight `NumpyShim` class to handle multi-dimensional array operations without the heavy overhead of the full NumPy library for this specific embedded context. This ensures our inference engine remains portable and fast.

### **Lines 28-39: Visualization of the State Space**
*   **`self.q_table`**: This 4-dimensional tensor represents our State-Action Value function $Q(s, a)$.
    *   **Dimensions**: `[Mastery(3) x Emotion(5) x LastDiff(3) x Actions(3)]`
    *   **Why these dimensions?**
        *   **Mastery**: We discretize continuous mastery (0-100%) into 3 buckets: Novice, Competent, Expert.
        *   **Emotion**: We track 5 distinct affective states: Engaged, Bored, Frustrated, Stable, Flow.
        *   **LastDiff**: We carry forward the previous difficulty context to prevent jarring transitions.
    *   **Total States**: $3 \times 5 \times 3 = 45$ distinct pedagogical states.

### **Lines 40-52: State Encoding (`get_state_index`)**
this method performs **Feature Discretization**.
*   It takes continuous signals (e.g., `mastery_score = 0.72`) and maps them to discrete grid coordinates (e.g., `Index 2` for Expert).
*   **Safety**: Line 50 clamps the emotion index to prevent array out-of-bounds errors, ensuring system robustness.

### **Lines 54-60: The Policy (`choose_action`)**
We implement an **$\epsilon$-Greedy Policy**:
*   **Exploration ($\epsilon=0.1$)**: 10% of the time, the agent tries a random action to discover new teaching strategies.
*   **Exploitation ($1-\epsilon$)**: 90% of the time, it selects $\text{argmax}_a Q(s, a)$—the action mathematically proven to yield the highest long-term reward.

### **Lines 61-70: The Learning Algorithm (`update`)**
This is the heart of Q-Learning:
$$Q(s,a) \leftarrow (1-\alpha)Q(s,a) + \alpha[R + \gamma \max Q(s', a')]$$
*   **`alpha` (Learning Rate)**: How fast we overwrite old knowledge.
*   **`gamma` (Discount Factor)**: How much we care about future rewards vs immediate ones.

### **Lines 72-106: The Reward Function**
We engineered a **Composite Reward Signal**:
1.  **Efficiency Reward**: $+1.0$ for correct answers, with a $+0.5$ bonus for speed (<20s) and difficulty.
2.  **Affective Reward**:
    *   **Flow State**: $+2.0$ (Highest priority).
    *   **Frustration**: $-2.0$ (Strong penalty).
    *   **Boredom**: $-1.0$ (Mild penalty).
*   **Weighted Sum**: `Reward = 0.6 * Efficiency + 0.4 * Engagement`. We explicitly balance academic progress with student well-being.

---

## 2. `backend/model/emotion.py` (The "Empathy")

This component acts as a **Heuristic Classifier** for real-time affect detection.

### **Lines 9-27: Feature Extraction**
We treat user interaction logs as a time-series stream.
*   We extract **proxies** for emotion: `time_taken`, `is_correct`, `rage_clicks` (rapid clicking), and `tab_switches` (focus loss).

### **Lines 28-45: Frustration Logic**
*   **Rage Clicks**: If `telemetry.get('rageClicks') > 0`, we immediately classify as **Frustrated**. This is a high-confidence signal.
*   **Struggle Pattern**: If a user spends >60s and fails, or fails 2+ times in a row, the `consecutive_errors` counter triggers the Frustrated state.

### **Lines 55-60: Flow State Detection**
This is our novel contribution. We define **Flow** as:
*   **Correctness**: Must be correct.
*   **Velocity**: Time between 3s and 25s (The "Goldilocks Zone"—not too fast to be guessing, not too slow to be struggling).
*   **Focus**: Zero tab switches.

---

## 3. `backend/model/knowledge_graph.py` (The "Map")

This file implements **Bayesian Knowledge Tracing (BKT)** on a directed acyclic graph (DAG).

### **Lines 11-59: The Ontology (`CONCEPT_GRAPH`)**
We model the curriculum as a dependency graph.
*   **Nodes**: Concepts (e.g., 'Recursion').
*   **Edges**: Prerequisite relationships (e.g., 'Arrays' $\rightarrow$ 'Pointers').
*   **Why?** This prevents the "Cold Start" problem. We know that if a student struggles with 'Arrays', they cannot possibly master 'Pointers'.

### **Lines 83-108: Bayesian Update (`update_mastery`)**
We maintain a probabilistic belief $P(L_n)$ that a student has mastered concept $n$.
*   **The Slip Parameter (`p_slip=0.1`)**: The probability a student knows the concept but made a distinct mistake.
*   **The Guess Parameter (`p_guess=0.2`)**: The probability a student doesn't know the concept but guessed correctly.
*   **Bayes Rule**: We update our belief based on new evidence (Correct/Incorrect) using these parameters, allowing the system to handle noisy data gracefully.

### **Lines 110-149: Recommendation Engine (`get_next_recommended_concept`)**
This function implements **Vygotsky's Zone of Proximal Development (ZPD)**.
1.  **Filter**: It finds all concepts where `Prerequisite_Mastery > 0.6`.
2.  **Select**: From those, it picks the concept where `Current_Mastery` is closest to **0.5**.
    *   **Why 0.5?** This represents maximum uncertainty—the concept the student is *ready* to learn but hasn't *yet* mastered. This is the optimal point for intervention.
