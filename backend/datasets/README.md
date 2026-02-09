# EduPulse LLM Training Datasets

This directory contains curated datasets used to fine-tune the EduPulse AI components.

## 📁 Files

### `edupulse_fine_tuning_data.jsonl`
**Format:** JSON Lines (JSONL)  
**Purpose:** Fine-tuning dataset for instruction-following behavior  
**Size:** 7 examples (demonstration dataset)

## 🎯 Dataset Categories

Our training data covers four main use cases:

### 1. **Socratic Tutoring** 
Training the AI to provide scaffolded hints rather than direct answers.

**Example:**
```json
{
  "messages": [
    {"role": "system", "content": "You are EduPulse, an empathetic AI tutor..."},
    {"role": "user", "content": "I'm stuck on this recursion problem. How do I even start?"},
    {"role": "assistant", "content": "Recursion can be tricky! Let's break it down..."}
  ]
}
```

### 2. **Question Generation**
Teaching the model to generate properly structured questions with metadata.

**Output Schema:**
```json
{
  "concept": "Dynamic Programming",
  "difficulty": 3,
  "question": "...",
  "options": ["...", "...", "...", "..."],
  "correct_answer": "...",
  "explanation": "..."
}
```

### 3. **Emotion Inference**
Training the model to analyze student emotional states from behavioral signals.

**Input Features:**
- Response time
- Correctness
- Click patterns
- Hesitation metrics

**Output:**
```json
{
  "emotion": "frustrated",
  "confidence": 0.85,
  "reasoning": "..."
}
```

### 4. **Curriculum Planning**
Generating personalized learning paths based on student knowledge state.

**Example Output:**
```json
{
  "path": [
    "Adjacency Matrix vs List",
    "BFS Traversal",
    "DFS Traversal",
    "Shortest Path (Dijkstra)",
    "Minimum Spanning Tree (Prim's)"
  ]
}
```

## 🔧 Usage

### Fine-Tuning with OpenAI API
```bash
openai api fine_tunes.create \
  -t edupulse_fine_tuning_data.jsonl \
  -m gpt-3.5-turbo
```

### Fine-Tuning with Google AI Studio (Gemini)
```python
import google.generativeai as genai

model = genai.GenerativeModel('gemini-1.5-flash')
model.tune(training_data='edupulse_fine_tuning_data.jsonl')
```

## 📊 Data Collection

The training examples were curated from:
- **Real student interactions** (anonymized)
- **Expert pedagogy guidelines** from educational research
- **Curriculum standards** for CS education
- **Synthetic augmentation** for edge cases

## 🔒 Privacy

All student data is:
- ✅ Anonymized
- ✅ Aggregated
- ✅ Consent-based
- ✅ FERPA compliant

## 📈 Future Expansion

Planned additions:
- Multi-modal datasets (code + explanations)
- Reinforcement Learning from Human Feedback (RLHF) data
- Domain-specific datasets (Math, Physics, etc.)
