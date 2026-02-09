import os
from typing import List, Dict

class DiagnosticService:
    def __init__(self):
        pass # specific LLM service not needed for mock/hybrid approach yet

    def generate_diagnostic_questions(self, courses: List[str]) -> List[Dict]:
        """
        Generates 2 screening questions per selected course.
        """
        questions = []
        for course in courses:
            # Expanded Mock Question Bank
            if course == 'dsa':
                questions.extend([
                    {"id": "dsa_1", "course": "dsa", "concept": "Arrays", "question": "Time complexity of accessing array element by index?", "options": ["O(1)", "O(n)", "O(log n)", "O(n^2)"], "correct_answer": "O(1)", "difficulty": 1},
                    {"id": "dsa_2", "course": "dsa", "concept": "Recursion", "question": "What happens if a recursive function lacks a base case?", "options": ["Stack Overflow", "Infinite Loop", "Compilation Error", "Memory Leak"], "correct_answer": "Stack Overflow", "difficulty": 1},
                    {"id": "dsa_3", "course": "dsa", "concept": "Hashing", "question": "Best case time complexity for hash map lookup?", "options": ["O(1)", "O(n)", "O(log n)", "O(n log n)"], "correct_answer": "O(1)", "difficulty": 2},
                    {"id": "dsa_4", "course": "dsa", "concept": "Sorting", "question": "Which sort is O(n^2) in worst case?", "options": ["Bubble Sort", "Merge Sort", "Heap Sort", "Tim Sort"], "correct_answer": "Bubble Sort", "difficulty": 1},
                    {"id": "dsa_5", "course": "dsa", "concept": "Trees", "question": "Height of a balanced binary tree with N nodes?", "options": ["log N", "N", "N^2", "sqrt(N)"], "correct_answer": "log N", "difficulty": 2}
                ])
            elif course == 'math':
                questions.extend([
                    {"id": "math_1", "course": "math", "concept": "Algebra", "question": "Solve: 2x + 5 = 15", "options": ["5", "10", "2", "7.5"], "correct_answer": "5", "difficulty": 1},
                    {"id": "math_2", "course": "math", "concept": "Probability", "question": "Prob. of specific card from deck?", "options": ["1/52", "1/13", "1/4", "1/26"], "correct_answer": "1/52", "difficulty": 1},
                    {"id": "math_3", "course": "math", "concept": "Calculus", "question": "Derivative of x^2?", "options": ["2x", "x", "2", "x^3/3"], "correct_answer": "2x", "difficulty": 2},
                    {"id": "math_4", "course": "math", "concept": "Geometry", "question": "Sum of angles in a triangle?", "options": ["180", "360", "90", "270"], "correct_answer": "180", "difficulty": 1},
                    {"id": "math_5", "course": "math", "concept": "Stats", "question": "Measure of central tendency?", "options": ["Median", "Range", "Variance", "Deviation"], "correct_answer": "Median", "difficulty": 1}
                ])
            elif course == 'system_design':
                questions.extend([
                    {"id": "sys_1", "course": "system_design", "concept": "Load Balancing", "question": "Primary purpose of a Load Balancer?", "options": ["Distribute Traffic", "Encrypt Data", "Cache Images", "Store Logs"], "correct_answer": "Distribute Traffic", "difficulty": 1},
                    {"id": "sys_2", "course": "system_design", "concept": "Databases", "question": "ACID property 'A' stands for?", "options": ["Atomicity", "Availability", "Accuracy", "Authorization"], "correct_answer": "Atomicity", "difficulty": 2},
                    {"id": "sys_3", "course": "system_design", "concept": "Caching", "question": "Which is a common caching strategy?", "options": ["LRU", "FIFO", "LIFO", "Round Robin"], "correct_answer": "LRU", "difficulty": 2},
                    {"id": "sys_4", "course": "system_design", "concept": "CAP Theorem", "question": "In CAP, 'P' stands for?", "options": ["Partition Tolerance", "Performance", "Persistence", "Privacy"], "correct_answer": "Partition Tolerance", "difficulty": 3},
                    {"id": "sys_5", "course": "system_design", "concept": "Microservices", "question": "Key benefit of microservices?", "options": ["Scalability", "Simplicity", "Zero Latency", "Single Database"], "correct_answer": "Scalability", "difficulty": 2}
                ])
            elif course == 'web_dev':
                questions.extend([
                    {"id": "web_1", "course": "web_dev", "concept": "HTML/CSS", "question": "Tag for largest heading?", "options": ["<h1>", "<heading>", "<head>", "<h6>"], "correct_answer": "<h1>", "difficulty": 1},
                    {"id": "web_2", "course": "web_dev", "concept": "JavaScript", "question": "Keyword to declare a constant?", "options": ["const", "var", "let", "fixed"], "correct_answer": "const", "difficulty": 1},
                    {"id": "web_3", "course": "web_dev", "concept": "React", "question": "Hook for side effects?", "options": ["useEffect", "useState", "useContext", "useReducer"], "correct_answer": "useEffect", "difficulty": 2},
                    {"id": "web_4", "course": "web_dev", "concept": "HTTP", "question": "Status code for 'Not Found'?", "options": ["404", "200", "500", "403"], "correct_answer": "404", "difficulty": 1},
                    {"id": "web_5", "course": "web_dev", "concept": "Security", "question": "Protect against XSS by?", "options": ["Sanitizing Input", "Using HTTPS", "Hashing Passwords", "Disabling Cookies"], "correct_answer": "Sanitizing Input", "difficulty": 2}
                ])
        return questions

    def analyze_results(self, user_id: str, results: List[Dict]) -> Dict:
        """
        Analyzes diagnostic answers.
        results: list of {question_id, correct, course, concept}
        """
        analysis = {
            "strengths": [],
            "weaknesses": [],
            "baseline_mastery": {}, # course -> 0.0 to 1.0
            "concepts_to_review": []
        }
        
        course_scores = {}
        
        for res in results:
            course = res['course']
            concept = res['concept']
            is_correct = res['correct']
            
            if course not in course_scores: course_scores[course] = {"total": 0, "correct": 0}
            course_scores[course]["total"] += 1
            
            if is_correct:
                course_scores[course]["correct"] += 1
                analysis['strengths'].append(concept)
            else:
                analysis['weaknesses'].append(concept)
                analysis['concepts_to_review'].append(concept)

        for course, score in course_scores.items():
            mastery = score['correct'] / score['total']
            analysis['baseline_mastery'][course] = mastery

        # Generate Markdown Report
        self.save_profile_markdown(user_id, analysis, results)
        
        return analysis

    def save_profile_markdown(self, user_id: str, analysis: Dict, raw_results: List[Dict]):
        """
        Saves the analysis as a markdown file.
        """
        filename = f"user_profiles/{user_id}_knowledge_profile.md"
        os.makedirs(os.path.dirname(filename), exist_ok=True)
        
        md_content = f"""# Knowledge Profile: {user_id}
**Generated:** {os.popen('date').read().strip()}

## 📊 Executive Summary
* **Overall Standing:** {'Advanced' if len(analysis['strengths']) > len(analysis['weaknesses']) else 'Needs Foundation'}
* **Strongest Areas:** {', '.join(analysis['strengths']) or 'None detected yet'}
* **Critical Gaps:** {', '.join(analysis['weaknesses']) or 'None detected'}

## 🎯 Course Baselines
"""
        for course, mastery in analysis['baseline_mastery'].items():
            md_content += f"- **{course.upper()}:** {mastery*100:.1f}% Mastery\n"

        md_content += "\n## 📝 Diagnostic Detail\n"
        for res in raw_results:
            status = "✅ Correct" if res['correct'] else "❌ Incorrect"
            md_content += f"- **{res['course']} / {res['concept']}:** {status}\n"

        md_content += "\n## 🚀 Recommended Learning Path\n"
        if analysis['weaknesses']:
            md_content += "Based on these results, we recommend starting with:\n"
            for w in analysis['weaknesses']:
                md_content += f"1. [AI Tutor Lesson: {w}](/tutor?context={w})\n"
        else:
            md_content += "Great job! You are ready for advanced topics.\n"
            
        with open(filename, "w") as f:
            f.write(md_content)
        
        return filename

_instance = None
def get_diagnostic_service():
    global _instance
    if not _instance:
        _instance = DiagnosticService()
    return _instance
