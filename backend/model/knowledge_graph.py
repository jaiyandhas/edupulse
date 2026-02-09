from typing import Dict, List, Optional

class ConceptNode:
    def __init__(self, id: str, name: str, prerequisites: List[str] = None):
        self.id = id
        self.name = name
        self.prerequisites = prerequisites or []
        
# Static Definition of the Domain Graph
# In a real app, this might be loaded from a DB or JSON config
CONCEPT_GRAPH = {
    "dsa": {
        "nodes": {
            "arrays": ConceptNode("arrays", "Array Basics"),
            "pointers": ConceptNode("pointers", "Memory & Pointers", ["arrays"]),
            "linked_lists": ConceptNode("linked_lists", "Linked Lists", ["pointers"]),
            "stacks": ConceptNode("stacks", "Stacks & Queues", ["arrays", "linked_lists"]),
            "recursion": ConceptNode("recursion", "Recursion"),
            "sorting": ConceptNode("sorting", "Sorting Algorithms", ["arrays", "recursion"]),
            "trees": ConceptNode("trees", "Trees", ["recursion", "pointers"]),
        },
        "root": ["arrays", "recursion"] # Entry points
    },
    "school_math": {
        "nodes": {
            "integers": ConceptNode("integers", "Integer Arithmetic"),
            "fractions": ConceptNode("fractions", "Fractions", ["integers"]),
            "exponents": ConceptNode("exponents", "Exponents", ["integers"]),
            "algebra_basics": ConceptNode("algebra_basics", "Variables & Equations", ["integers", "fractions"]),
            "linear_eq": ConceptNode("linear_eq", "Linear Equations", ["algebra_basics"]),
            "quadratics": ConceptNode("quadratics", "Quadratic Equations", ["linear_eq", "exponents"]),
            "geometry_basics": ConceptNode("geometry_basics", "Basic Geometry"),
            "triangles": ConceptNode("triangles", "Triangles", ["geometry_basics", "algebra_basics"])
        },
        "root": ["integers", "geometry_basics"]
    },
    "system_design": {
        "nodes": {
            "load_balancing": ConceptNode("load_balancing", "Load Balancing"),
            "caching": ConceptNode("caching", "Caching Strategies"),
            "databases": ConceptNode("databases", "Database Scaling", ["caching"]),
            "cap_theorem": ConceptNode("cap_theorem", "CAP Theorem", ["databases"]),
            "microservices": ConceptNode("microservices", "Microservices", ["load_balancing"]),
            "api_design": ConceptNode("api_design", "API Design")
        },
        "root": ["load_balancing", "api_design"]
    },
    "web_dev": {
        "nodes": {
            "html_css": ConceptNode("html_css", "HTML & CSS"),
            "javascript": ConceptNode("javascript", "JavaScript Basics", ["html_css"]),
            "react": ConceptNode("react", "React Framework", ["javascript"]),
            "http": ConceptNode("http", "HTTP & Networking"),
            "security": ConceptNode("security", "Web Security", ["http"]),
            "performance": ConceptNode("performance", "Web Performance", ["javascript"])
        },
        "root": ["html_css", "http"]
    }
}

class KnowledgeState:
    def __init__(self):
        # Maps concept_id -> Probability of Mastery (0.0 to 1.0)
        self.mastery_probs = {}
        
    def get_mastery(self, concept_id: str) -> float:
        return self.mastery_probs.get(concept_id, 0.1) # Default prior 0.1

class KnowledgeTracingService:
    def __init__(self):
        # BKT Parameters (Simplified)
        self.p_init = 0.1   # Initial probability of knowing
        self.p_transit = 0.1 # Probability of learning after an interaction
        self.p_slip = 0.1   # Prob of mistake despite knowing (Slip)
        self.p_guess = 0.2  # Prob of correct despite not knowing (Guess)

    def initialize_user_state(self, domain: str) -> KnowledgeState:
        state = KnowledgeState()
        # Initialize roots with slightly higher priors?
        # For now, lazy load in get_mastery
        return state

    def update_mastery(self, state: KnowledgeState, concept_id: str, is_correct: bool):
        """
        Updates P(L) - Probability of Learning/Mastery using BKT rules.
        """
        p_learned = state.get_mastery(concept_id)
        
        # 1. Evidence Update (Bayes Rule)
        if is_correct:
            # P(L|Correct) = [P(Correct|L) * P(L)] / P(Correct)
            # P(Correct|L) = 1 - Slip
            # P(Correct|~L) = Guess
            p_obs = (p_learned * (1 - self.p_slip)) / \
                    (p_learned * (1 - self.p_slip) + (1 - p_learned) * self.p_guess)
        else:
            # P(L|Incorrect) = [P(Incorrect|L) * P(L)] / P(Incorrect)
            # P(Incorrect|L) = Slip
            # P(Incorrect|~L) = 1 - Guess
            p_obs = (p_learned * self.p_slip) / \
                    (p_learned * self.p_slip + (1 - p_learned) * (1 - self.p_guess))

        # 2. Transit Update (Learning occurred during this step)
        # P(L_next) = P(L_prev) + (1 - P(L_prev)) * P(Transit)
        p_new = p_obs + (1 - p_obs) * self.p_transit
        
        state.mastery_probs[concept_id] = min(0.99, max(0.01, p_new))
        return p_new

    def get_next_recommended_concept(self, state: KnowledgeState, domain: str) -> str:
        """
        Finds the 'Frontier' of knowledge:
        Concepts where:
        1. Prerequisites are met (High Mastery > 0.7)
        2. Concept itself is not yet mastered (Low Mastery < 0.85)
        3. Closest to the 'Zone of Proximal Development' (Mastery ~0.4-0.6)
        """
        graph = CONCEPT_GRAPH.get(domain)
        if not graph: return "generic"
        
        candidates = []
        
        for node_id, node in graph['nodes'].items():
            current_mastery = state.get_mastery(node_id)
            
            # Skip if already fully mastered
            if current_mastery > 0.9:
                continue
                
            # Check Prerequisites
            prereqs_met = True
            for pid in node.prerequisites:
                if state.get_mastery(pid) < 0.6: # Prereq threshold
                    prereqs_met = False
                    break
            
            if prereqs_met:
                candidates.append((node_id, current_mastery))
        
        # Sort by "closest to 0.5" (maximum learning potential)
        # We want things that aren't too hard (0.0) or too easy (1.0)
        # But prioritize things we haven't started (0.1) over things we are stuck on?
        # Actually, standard Vygotsky: target 0.5 probability
        
        if not candidates:
            return "review" # Or generic
            
        candidates.sort(key=lambda x: abs(x[1] - 0.5))
        return candidates[0][0]

# Singleton
_kt_service = None
def get_kt_service():
    global _kt_service
    if _kt_service is None:
        _kt_service = KnowledgeTracingService()
    return _kt_service
