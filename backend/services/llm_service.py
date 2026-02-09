from abc import ABC, abstractmethod
import random
import time
import uuid
import uuid
from typing import Dict, List, Optional

class LLMService(ABC):
    @abstractmethod
    def generate_question(self, domain: str, difficulty: int, concept: str = None, interests: List[str] = None) -> Dict:
        pass

    @abstractmethod
    def generate_hint(self, question: Dict, student_answer: str) -> str:
        pass

import json
from .gemini_service import get_llm_service as get_gemini_core

class TemplateLLMService(LLMService):
    """
    Formerly MockLLMService. Fast, deterministic, server-side logic.
    """
    def __init__(self):
        self.templates = {
            "dsa": {
                "arrays": {
                    "content": {
                        1: "Think of an Array like a row of mailboxes. Each box has a number (index) and can store one item. You can instantly find any item if you know its number (O(1)), but adding a new mailbox in the middle requires shifting everything else (O(n)).",
                        2: "Arrays are stored in contiguous memory blocks. This locality improves cache performance. However, their fixed size means resizing is expensive (creating a new larger array and copying elements).",
                        3: "Advanced Array manipulation involves techniques like Two Pointers, Sliding Window, and Prefix Sums to optimize time complexity from O(n^2) to O(n) for many problems."
                    },
                    "templates": [
                        "How would you find the {target} element in an {adj} array of size n?",
                        "Calculate the {metric} of a contiguous subarray in an array of {data_type}."
                    ]
                },
                "sorting": {
                    "content": {
                        1: "Sorting is like arranging a deck of cards. You want to put them in order (e.g., smallest to largest). Some ways are simple but slow (Bubble Sort), while others are complex but fast (Merge Sort).",
                        2: "Efficient sorting algorithms like Merge Sort and Quick Sort use a 'Divide and Conquer' strategy, achieving O(n log n) time complexity, which is much faster than O(n^2) for large datasets.",
                        3: "Key trade-offs in sorting: Stability (preserving order of equal elements) and In-Place sorting (O(1) extra memory). QuickSort is in-place but unstable; Merge Sort is stable but needs O(n) memory."
                    },
                    "templates": [
                         "Explain why {algo} might perform worse than {algo2} on {condition} data.",
                         "Trace the execution of {algo} on the input {input_sample}."
                    ]
                }
            },
            "operating_systems": {
                 "processes": {
                     "content": "A Process is a program in execution. It passes through states: New -> Ready -> Running -> Waiting -> Terminated.",
                     "templates": ["Explain the state transition from {state1} to {state2} in a process lifecycle."]
                 },
                 "scheduling": {
                     "content": "CPU Scheduling determines which process runs when. Preemptive scheduling allows interruption, non-preemptive does not.",
                     "templates": ["Why is {algo} scheduling preferred for {usertype} systems?"]
                 }
            },
            "dbms": {
                 "sql": {
                     "content": "SQL (Structured Query Language) is used to manage relational databases. Key commands include SELECT, INSERT, UPDATE, DELETE.",
                     "templates": ["Write a query to finding the {agg} salary from the Employee table."]
                 },
                 "normalization": {
                     "content": "Normalization reduces redundancy. 1NF: Atomic values. 2NF: No partial dependency. 3NF: No transitive dependency.",
                     "templates": ["Decompose a table with functional dependency {fd} into {nf}."]
                 }
            },
            "networks": {
                 "osi": {
                     "content": "The OSI Model has 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, Application.",
                     "templates": ["What is the primary function of the {layer} layer in the OSI model?"]
                 },
                 "tcp": {
                     "content": "TCP is connection-oriented and reliable. UDP is connectionless and fast. TCP uses a 3-way handshake (SYN, SYN-ACK, ACK).",
                     "templates": ["Explain the {flag} flag in the TCP 3-way handshake."]
                 }
            },
            "school_math": {
                "integers": { "content": "Integers are whole numbers. Linear equations find the value of x that satisfies the equality.", "templates": ["Solve for x: {coef}x + {const} = {result}"] },
                "geometry_basics": { "content": "Geometry deals with shapes. Area is the space inside, Perimeter is the distance around.", "templates": ["Calculate the area of a {shape} with side length {val}."] }
            },
            "system_design": {
                 "load_balancing": { "content": "Load Balancers distribute traffic across servers to ensure reliability and speed.", "templates": ["How does {lb_algo} load balancing handle server failure?"] },
                 "caching": { "content": "Caching stores copies of data for faster access. Eviction policies (LRU, LFU) decide what to delete when full.", "templates": ["Explain the {cache_policy} eviction policy."] }
            },
            "web_dev": {
                 "react": { "content": "React components manage UI. useEffect handles side effects like data fetching.", "templates": ["Explain the useEffect dependency array behavior when {condition}."] },
                 "http": { "content": "HTTP methods: GET (Full), POST (Create), PUT (Replace), PATCH (Update), DELETE (Remove).", "templates": ["What is the difference between {method1} and {method2}?"] }
            }
        }
        
    def generate_question(self, domain: str, difficulty: int, concept: str = None, interests: List[str] = None) -> Optional[Dict]:
        """
        Generates a deterministic question from templates with educational content.
        """
        if domain not in self.templates: return None
        
        domain_templates = self.templates[domain]
        selected_concept = concept
        
        # 1. Select Concept & Template
        if concept and concept in domain_templates:
            # Specific Concept
            concept_data = domain_templates[concept]
        else:
            # Random Concept
            concepts = list(domain_templates.keys())
            if not concepts: return None
            selected_concept = random.choice(concepts)
            concept_data = domain_templates[selected_concept]
            
        # Handle New Structure (Dict with content/templates) vs Old (List)
        if isinstance(concept_data, dict) and "templates" in concept_data:
             template_list = concept_data["templates"]
             raw_content = concept_data.get("content", "Review this concept.")
             
             # Adaptive Content Selector
             if isinstance(raw_content, dict):
                 # Get content specific to difficulty, fallback to nearest or 1
                 content_str = raw_content.get(difficulty) or raw_content.get(1) or list(raw_content.values())[0]
             else:
                 content_str = raw_content
                 
        elif isinstance(concept_data, list):
             # Fallback for any old structure legacy
             template_list = concept_data
             content_str = "Review the core concepts for this topic."
        else:
             return None

        if not template_list: return None
        template_str = random.choice(template_list)
            
        # 2. Fill Template & Generate Options
        q_data = self._fill_template(template_str, domain, difficulty, selected_concept)
        if q_data:
            q_data['concept_content'] = content_str # Attach the lesson
            
        return q_data

    def _fill_template(self, template_str: str, domain: str, difficulty: int, concept: str) -> Dict:
        """
        Fills placeholders ({x}, {y}) with random values and generates distractors.
        """
        import random
        
        question_text = template_str
        correct_answ = ""
        options = []
        hint = ""
        explanation = ""
        
        # --- School Math Logic ---
        if domain == "school_math":
            if "{coef}" in template_str: # Linear Eq: {coef}x + {const} = {result}
                coef = random.randint(2, 10)
                const = random.randint(1, 20)
                x = random.randint(1, 12)
                result = coef * x + const
                
                question_text = template_str.format(coef=coef, const=const, result=result, x="x")
                correct_answ = str(x)
                
                # Distractors (Ensure Unique)
                distractors = set()
                distractors.add(x) # Always include correct answer
                
                # Try to generate unique distractors
                attempts = 0
                while len(distractors) < 4 and attempts < 20:
                    offset = random.randint(-5, 5)
                    if offset != 0:
                        distractors.add(x + offset)
                    attempts += 1
                
                # Fallback if stuck (should trigger rarely)
                while len(distractors) < 4:
                    distractors.add(random.randint(1, 100))
                    
                options = [str(d) for d in distractors]
                hint = f"Subtract {const} from {result}, then divide by {coef}."
                explanation = f"{coef}x + {const} = {result} -> {coef}x = {result-const} -> x = {x}"
                
            elif "{shape}" in template_str: # Geometry
                shape = "square"
                side = random.randint(2, 15)
                question_text = template_str.format(shape=shape, val=side)
                
                area = side * side
                correct_answ = str(area)
                
                distractors = {area, area*2, side*4, side+side}
                # Fill up if duplicates (e.g. side=4, area=16, side*4=16)
                while len(distractors) < 4:
                    distractors.add(area + random.randint(1, 10))
                    
                options = [str(d) for d in distractors]
                hint = "Area of a square is side * side."
                explanation = f"{side} * {side} = {area}"
                
        # --- DSA Logic (Simplified) ---
        elif domain == "dsa":
             # Generic logic for text-based templates (mocking calculation)
             vals = {
                 "adj": random.choice(["sorted", "unsorted", "sparse"]),
                 "target": random.choice(["max", "min", "median"]),
                 "metric": random.choice(["sum", "average", "product"]),
                 "data_type": random.choice(["integers", "floats", "strings"]),
                 "algo": random.choice(["QuickSort", "MergeSort", "BubbleSort"]),
                 "algo2": random.choice(["GoSort", "TimSort", "HeapSort"]),
                 "condition": random.choice(["almost sorted", "reverse sorted", "random"]),
                 "input_sample": f"[{random.randint(1,9)}, {random.randint(1,9)}, ...]"
             }
             try: question_text = template_str.format(**vals)
             except KeyError: question_text = template_str
             
             correct_answ = "O(n)"
             options = ["O(1)", "O(n)", "O(log n)", "O(n^2)"]
             hint = "Consider the worst-case scenario."
             explanation = "Standard complexity analysis."

        elif domain in ["operating_systems", "dbms", "networks"]:
             # Logic for new CS domains
             vals = {
                 # OS
                 "state1": random.choice(["Ready", "Running", "Waiting"]),
                 "state2": random.choice(["Terminated", "Running", "Blocked"]),
                 "usertype": random.choice(["Real-Time", "Batch", "Interactive"]),
                 
                 # DBMS
                 "agg": random.choice(["MAX", "MIN", "AVG", "SUM"]),
                 "fd": random.choice(["A->B", "X->Y", "ID->Name"]),
                 "nf": random.choice(["2NF", "3NF", "BCNF"]),
                 
                 # Networks
                 "layer": random.choice(["Network", "Transport", "Application"]),
                 "flag": random.choice(["SYN", "ACK", "FIN", "RST"]),
                 
                 # Shared
                 "algo": random.choice(["Round-Robin", "SJF", "Priority"])
             }
             try: question_text = template_str.format(**vals)
             except KeyError: question_text = template_str # robustness
             
             correct_answ = "Concept Answer"
             options = ["Concept Answer", "Distractor A", "Distractor B", "Distractor C"]
             hint = "Review the theoretical definition."
             explanation = "This is a core concept in the field."

        else:
             # Generic Fallback for other domains
             question_text = template_str.replace("{", "").replace("}", "")
             correct_answ = "Correct Option"
             options = ["Correct Option", "Distractor 1", "Distractor 2", "Distractor 3"]

        # Shuffle Options
        random.shuffle(options)
        
        # Use Hash of question text as ID to prevent duplicates in session history
        # (exclude_ids logic in session.py relies on this)
        import hashlib
        q_hash = hashlib.md5(question_text.encode()).hexdigest()
        
        return {
            "id": f"tmpl_{q_hash}",
            "question": question_text,
            "options": options,
            "correct_answer": correct_answ,
            "difficulty": difficulty,
            "concept": concept or "General",
            "interests": [],
            "hint": hint,
            "explanation": explanation
        }

    def generate_hint(self, question: Dict, student_answer: str) -> str:
        return "Template Hint"

class GeminiLLMService(LLMService):
    """
    Real AI Generation via Gemini.
    """
    def __init__(self):
        self.core = get_gemini_core()
        
    def generate_question(self, domain: str, difficulty: int, concept: str = None, interests: List[str] = None) -> Dict:
        prompt = f"""
        Generate a multiple-choice question for {domain} (Difficulty {difficulty}/3).
        Concept: {concept or 'Basics'}.
        User Interests: {interests}.
        Output JSON: {{ "question": "...", "options": ["A", "B", "C", "D"], "correct_answer": "...", "hint": "...", "explanation": "..." }}
        """
        try:
            text = self.core.generate_content(prompt)
            if not text: raise ValueError("Empty AI response")
            # Parse JSON (Naive cleanup)
            text = text.replace("```json", "").replace("```", "").strip()
            data = json.loads(text)
            data['id'] = f"ai_{uuid.uuid4()}"
            data['difficulty'] = difficulty
            data['concept'] = concept
            data['interests'] = interests
            return data
        except Exception as e:
            print(f"AI Generation Failed: {e}")
            return None # Trigger Fallback

    def generate_hint(self, question: Dict, student_answer: str) -> str:
        return "AI Hint"

class HybridLLMService(LLMService):
    """
    Orchestrator: Templates -> AI -> Fallback
    """
    def __init__(self):
        self.template_engine = TemplateLLMService()
        self.ai_engine = GeminiLLMService()
        
    def generate_question(self, domain: str, difficulty: int, concept: str = None, interests: List[str] = None) -> Dict:
        # Strategy 1: Use Templates for Easy/Medium (reduce API calls)
        if difficulty <= 2:
            q = self.template_engine.generate_question(domain, difficulty, concept, interests)
            if q: 
                print("Hybrid: Served via Template (Fast)")
                return q
                
        # Strategy 2: Use AI for Hard/Novel concepts
        print("Hybrid: Delegating to Gemini AI...")
        q = self.ai_engine.generate_question(domain, difficulty, concept, interests)
        if q: return q
        
        # Strategy 3: Fallback to Template if AI fails
        print("Hybrid: AI failed, falling back to Template")
        q = self.template_engine.generate_question(domain, difficulty, concept, interests)
        if q: return q
        
        # Final Safety Net
        return {
             "id": "safety_net",
             "question": f"Could not generate question for {domain}. Please try again.",
             "options": ["Retry"],
             "correct_answer": "Retry",
             "difficulty": 1
        }

    def get_lesson_content(self, domain: str, concept: str) -> Dict:
        """
        Returns a full educational lesson for the concept.
        """
        # Mock Data for Prototype
        lessons = {
            "arrays": {
                "title": "Arrays: The Foundation of Data Storage",
                "video_url": "https://www.youtube.com/embed/RBSGKlAvoirM", # Mock embed
                "content_md": """
# Introduction to Arrays

An **Array** is one of the most fundamental data structures in computer science. Think of it as a contiguous block of memory divided into equal-sized slots.

## Key Properties
- **Fixed Size:** Once created, you cannot change its size (in static arrays).
- **Random Access:** You can access any element instantly `O(1)` if you know its index.
- **Homogeneous:** All elements must be of the same type (int, float, etc.).

## Visual Analogy
Imagine a street with houses numbered 0, 1, 2, 3...
- To find the house at index #3, you go directly there.
- To insert a new house between #1 and #2? Impossible without moving every other house down the street!

## Time Complexity
| Operation | Complexity | Description |
|-----------|------------|-------------|
| Access    | O(1)       | Instant lookup |
| Search    | O(n)       | Scan entire list |
| Insertion | O(n)       | Shift elements |
| Deletion  | O(n)       | Shift elements |
"""
            },
            "sorting": {
                "title": "The Art of Sorting",
                "video_url": "https://www.youtube.com/embed/Kg4bqzAqRBM",
                "content_md": """
# Why Sort?

Sorting is the process of arranging data in a specific order (ascending or descending). It is critical because **searching** a sorted list is much faster (`O(log n)`) than an unsorted one (`O(n)`).

## Common Algorithms

### 1. Bubble Sort `O(n^2)`
- The simplest method.
- Repeatedly swaps adjacent elements if they are in the wrong order.
- **Verdict:** Good for learning, bad for production.

### 2. Merge Sort `O(n log n)`
- A "Divide and Conquer" algorithm.
- Splits the list in half, sorts each half, and merges them back.
- **Verdict:** Excellent for large datasets.

### 3. Quick Sort `O(n log n)`
- Picks a "pivot" and partitions the array around it.
- **Verdict:** Often the fastest in practice, but unstable.
"""
            }
        }
        
        # Default/Fallback
        empty_lesson = {
            "title": f"Lesson: {concept.replace('_', ' ').title()}",
            "video_url": "",
            "content_md": f"# {concept.title()}\n\nContent for this topic is currently being generated by our AI curriculum team. Please proceed to the practice questions to test your existing knowledge."
        }
        
        return lessons.get(concept, empty_lesson)

    def get_concept_path(self, domain: str, current_concept: str) -> Dict[str, str]:
        """
        Determines the next concept (Advance) or previous concept (Remediate).
        Simple linear progression for now.
        """
        # Concept Dependency Graphs (Linear)
        paths = {
            "dsa": ["arrays", "linked_lists", "stacks", "queues", "sorting", "trees", "graphs"],
            "dbms": ["sql", "normalization", "indexing", "transactions"],
            "operating_systems": ["processes", "scheduling", "deadlocks", "memory_management"],
            "networks": ["osi", "tcp", "ip", "http_dns"],
            "system_design": ["load_balancing", "caching", "databases", "message_queues"],
            "web_dev": ["http", "react", "state_management", "backend_integration"]
        }
        
        if domain not in paths:
            return {"action": "stay", "target": current_concept}
            
        sequence = paths[domain]
        try:
            current_idx = sequence.index(current_concept)
        except ValueError:
            return {"action": "stay", "target": sequence[0]} # Fallback to start
            
        # Logic
        next_concept = sequence[current_idx + 1] if current_idx + 1 < len(sequence) else "mastery_complete"
        prev_concept = sequence[current_idx - 1] if current_idx > 0 else "foundations"
        
        return {
            "advance": next_concept,
            "remediate": prev_concept,
            "current": current_concept
        }

    def generate_hint(self, question: Dict, student_answer: str) -> str:
        return self.ai_engine.generate_hint(question, student_answer)

# Singleton factory
_service_instance = None

def get_llm_service():
    global _service_instance
    if _service_instance is None:
        _service_instance = HybridLLMService()
    return _service_instance
