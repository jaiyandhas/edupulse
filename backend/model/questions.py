
# Data Structures & Algorithms Question Bank
# Difficulty: 1 (Easy), 2 (Medium), 3 (Hard)


# Question Bank: Multi-Domain Support
# Difficulty: 1 (Easy), 2 (Medium), 3 (Hard)

QUESTION_BANK = {
    "dsa": [
        {
            "id": "q1",
            "question": "In a standard computer architecture, what is the precise time complexity of accessing an element in a contiguous memory array given its index?",
            "options": ["O(1) - Constant Time", "O(n) - Linear Time", "O(log n) - Logarithmic Time", "O(1) Amortized"],
            "correct_answer": "O(1) - Constant Time",
            "difficulty": 1,
            "concept": "Arrays",
            "hint": "Arrays use pointer arithmetic (Base Address + Index * Size) to locate elements immediately.",
            "explanation": "Array access is O(1) because the memory address is calculated directly using the formula: Address = Base + (Index * Element_Size). No traversal is required."
        },
        {
            "id": "q2",
            "question": "Which data structure rigidly adheres to the LIFO (Last In, First Out) principle, making it ideal for function call management?",
            "options": ["Queue", "Stack", "LinkedList", "Binary Tree"],
            "correct_answer": "Stack",
            "difficulty": 1,
            "concept": "Stacks",
            "hint": "Think of a physical stack of plates; you can only remove the top one.",
            "explanation": "A Stack follows LIFO. The last element pushed is the first one popped. This behavior is crucial for managing function calls (the call stack) and undo mechanisms."
        },
        {
            "id": "q3",
            "question": "In a standard singly linked list, what is the computational cost of prepending a new node to the head?",
            "options": ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
            "correct_answer": "O(1)",
            "difficulty": 1,
            "concept": "Linked Lists",
            "hint": "This operation only requires changing the new node's next pointer and the head reference.",
            "explanation": "Inserting at the head is O(1) because it strictly involves pointer updates: NewNode.next = Head, then Head = NewNode. No traversal is needed."
        },
        {
            "id": "q4",
            "question": "What is the worst-case time complexity of QuickSort?",
            "options": ["O(n log n)", "O(n^2)", "O(n)", "O(log n)"],
            "correct_answer": "O(n^2)",
            "difficulty": 2,
            "concept": "Sorting",
            "hint": "This happens when the pivot chosen is always the smallest or largest element."
        },
        {
            "id": "q5",
            "question": "Which of these is NOT a linear data structure?",
            "options": ["Array", "Linked List", "Tree", "Stack"],
            "correct_answer": "Tree",
            "difficulty": 1,
            "concept": "Data Structures Basics",
            "hint": "Linear structures arrange data sequentially."
        },
        {
            "id": "q6",
            "question": "What data structure is used for Breadth-First Search (BFS) in a graph?",
            "options": ["Stack", "Queue", "Heap", "Hash Map"],
            "correct_answer": "Queue",
            "difficulty": 2,
            "concept": "Graph Traversal",
            "hint": "BFS explores neighbors level by level."
        },
        {
            "id": "q7",
            "question": "What is the primary advantage of a Hash Table?",
            "options": ["Sorted data storage", "Fast lookups on average", "Memory efficiency", "Traversal speed"],
            "correct_answer": "Fast lookups on average",
            "difficulty": 2,
            "concept": "Hash Tables",
            "hint": "It maps keys to values for direct access."
        },
        {
            "id": "q8",
            "question": "Which sorting algorithm is stable?",
            "options": ["Merge Sort", "Quick Sort", "Heap Sort", "Selection Sort"],
            "correct_answer": "Merge Sort",
            "difficulty": 2,
            "concept": "Sorting",
            "hint": "Stable sorts preserve the relative order of equal elements."
        },
        {
            "id": "q9",
            "question": "What is the time complexity of searching in a balanced Binary Search Tree (BST)?",
            "options": ["O(n)", "O(log n)", "O(1)", "O(n log n)"],
            "correct_answer": "O(log n)",
            "difficulty": 2,
            "concept": "Trees",
            "hint": "Each step cuts the search space in half."
        },
        {
            "id": "q10",
            "question": "To implement a priority queue, which data structure is most efficient?",
            "options": ["Array", "Linked List", "Heap", "Stack"],
            "correct_answer": "Heap",
            "difficulty": 2,
            "concept": "Heaps",
            "hint": "Allows O(log n) insertions and O(log n) extraction of max/min."
        },
        {
            "id": "q11",
            "question": "What is the space complexity of a recursive implementation of DFS on a tree?",
            "options": ["O(1)", "O(h) where h is height", "O(n)", "O(2^n)"],
            "correct_answer": "O(h) where h is height",
            "difficulty": 2,
            "concept": "Graph Traversal",
            "hint": "Recursion uses the call stack."
        },
        {
            "id": "q12",
            "question": "Dijkstra's algorithm is used for?",
            "options": ["Longest path", "Shortest path in unweighted graph", "Shortest path in weighted graph", "Minimum Spanning Tree"],
            "correct_answer": "Shortest path in weighted graph",
            "difficulty": 3,
            "concept": "Graph Algorithms",
            "hint": "It handles weights but not negative edges."
        },
        {
            "id": "q13",
            "question": "Which problem is typically solved using Dynamic Programming?",
            "options": ["Binary Search", "Knapsack Problem", "Quick Sort", "Tower of Hanoi"],
            "correct_answer": "Knapsack Problem",
            "difficulty": 3,
            "concept": "Dynamic Programming",
            "hint": "It involves overlapping subproblems."
        },
        {
            "id": "q14",
            "question": "What is the time complexity of the Floyd-Warshall algorithm?",
            "options": ["O(V^3)", "O(E log V)", "O(V^2)", "O(V+E)"],
            "correct_answer": "O(V^3)",
            "difficulty": 3,
            "concept": "Graph Algorithms",
            "hint": "It computes all-pairs shortest paths."
        },
        {
            "id": "q15",
            "question": "In a Red-Black Tree, what is the maximum height?",
            "options": ["O(n)", "O(log n)", "O(n/2)", "O(sqrt(n))"],
            "correct_answer": "O(log n)",
            "difficulty": 3,
            "concept": "Advanced Research Data Structures",
            "hint": "It is a self-balancing binary search tree."
        },
        {
            "id": "q16",
            "question": "What is the definition of a 'Greedy' algorithm?",
            "options": ["Makes the locally optimal choice at each step", "Checks all possibilities", "Uses memoization", "Divides problem into smaller subproblems"],
            "correct_answer": "Makes the locally optimal choice at each step",
            "difficulty": 2,
            "concept": "Algorithm Design",
            "hint": "It hopes local optimum leads to global optimum."
        },
        {
            "id": "q17",
            "question": "Which traversal of a BST yields sorted elements?",
            "options": ["Pre-order", "In-order", "Post-order", "Level-order"],
            "correct_answer": "In-order",
            "difficulty": 2,
            "concept": "Trees",
            "hint": "Left, Root, Right."
        },
        {
            "id": "q18",
            "question": "What is the worst-case complexity of searching in a Hash Table with collisions handled by chaining?",
            "options": ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
            "correct_answer": "O(n)",
            "difficulty": 2,
            "concept": "Hash Tables",
            "hint": "Happens if all keys hash to the same bucket."
        },
        {
            "id": "q19",
            "question": "Union-Find data structure is optimized using?",
            "options": ["Path Compression", "Rotation", "Rebalancing", "Heapify"],
            "correct_answer": "Path Compression",
            "difficulty": 3,
            "concept": "Advanced Data Structures",
            "hint": "It flattens the structure during find operations."
        },
        {
            "id": "q20",
            "question": "Kruskal's algorithm builds a Minimum Spanning Tree by?",
            "options": ["Adding edges by weight", "Growing from a vertex", "Removing edges", "Shortest path"],
            "correct_answer": "Adding edges by weight",
            "difficulty": 3,
            "concept": "Graph Algorithms",
            "hint": "It sorts edges and adds them if they don't form a cycle."
        },
    ],
    "operating_systems": [
        {
            "id": "os1", "difficulty": 1, "concept": "Processes",
            "question": "What is a 'Process' in an Operating System?",
            "options": ["A program in execution", "A stored file", "A hardware component", "A system call"],
            "correct_answer": "A program in execution", "hint": "It is an active entity."
        },
        {
            "id": "os2", "difficulty": 2, "concept": "Deadlocks",
            "question": "Which condition is NOT necessary for a Deadlock?",
            "options": ["Mutual Exclusion", "Hold and Wait", "Preemption", "Circular Wait"],
            "correct_answer": "Preemption", "hint": "Deadlocks happen when resources cannot be preempted."
        },
        {
            "id": "os3", "difficulty": 3, "concept": "Memory Management",
            "question": "Which algorithm suffers from Belady's Anomaly?",
            "options": ["FIFO", "LRU", "Optimal", "LFU"],
            "correct_answer": "FIFO", "hint": "More frames can cause more page faults."
        }
    ],
    "dbms": [
        {
            "id": "db1", "difficulty": 1, "concept": "SQL Basics",
            "question": "What does SQL stand for?",
            "options": ["Structured Query Language", "Simple Query Logic", "System Question Language", "Standard Query Link"],
            "correct_answer": "Structured Query Language", "hint": "Standard for Relational Databases."
        },
        {
            "id": "db2", "difficulty": 2, "concept": "Normalization",
            "question": "Which Normal Form eliminates Transitive Dependencies?",
            "options": ["3NF", "2NF", "1NF", "BCNF"],
            "correct_answer": "3NF", "hint": "2NF handles partial dependencies."
        },
        {
            "id": "db3", "difficulty": 3, "concept": "Transactions",
            "question": "Which property ensures database consistency after a crash?",
            "options": ["Durability", "Atomicity", "Isolation", "Consistency"],
            "correct_answer": "Durability", "hint": "The 'D' in ACID."
        }
    ],
    "networks": [
        {
            "id": "net1", "difficulty": 1, "concept": "OSI Model",
            "question": "Which layer is responsible for routing?",
            "options": ["Network Layer", "Transport Layer", "Data Link Layer", "Physical Layer"],
            "correct_answer": "Network Layer", "hint": "IP Addresses live here."
        },
        {
            "id": "net2", "difficulty": 2, "concept": "Protocols",
            "question": "Which protocol is connection-oriented?",
            "options": ["TCP", "UDP", "IP", "ICMP"],
            "correct_answer": "TCP", "hint": "It guarantees delivery."
        }
    ],
    "school_math": [
        {
            "id": "m1",
            "question": "Solve the linear equation for x: 2x + 5 = 15",
            "options": ["x = 5", "x = 10", "x = 2", "x = 7.5"],
            "correct_answer": "x = 5",
            "difficulty": 1,
            "concept": "Algebra",
            "hint": "Isolate the term with x by subtracting 5 from both sides.",
            "explanation": "First, subtract 5 from both sides: 2x = 10. Then, divide by 2: x = 5."
        },
        {
            "id": "m2",
            "question": "What is the area of a circle with radius 3?",
            "options": ["6π", "9π", "3π", "12π"],
            "correct_answer": "9π",
            "difficulty": 1,
            "concept": "Geometry",
            "hint": "Area = πr²"
        },
        {
            "id": "m3",
            "question": "If a triangle has angles 90° and 45°, what is the third angle?",
            "options": ["45°", "90°", "60°", "30°"],
            "correct_answer": "45°",
            "difficulty": 1,
            "concept": "Geometry",
            "hint": "Sum of angles in a triangle is 180°."
        },
        {
            "id": "m4",
            "question": "Simplify: (x^2 * x^3)",
            "options": ["x^6", "x^5", "x", "x^23"],
            "correct_answer": "x^5",
            "difficulty": 2,
            "concept": "Exponents",
            "hint": "Add the exponents when multiplying same bases."
        },
        {
            "id": "m5",
            "question": "What is the Pythagorean theorem?",
            "options": ["a + b = c", "a^2 + b^2 = c^2", "a^2 - b^2 = c^2", "a = b = c"],
            "correct_answer": "a^2 + b^2 = c^2",
            "difficulty": 1,
            "concept": "Geometry",
            "hint": "Relates the sides of a right triangle."
        },
        {
            "id": "m6",
            "question": "Slope of the line y = 3x - 2 is?",
            "options": ["-2", "3", "x", "1"],
            "correct_answer": "3",
            "difficulty": 2,
            "concept": "Linear Equations",
            "hint": "Equation is in y = mx + c form."
        },
        {
            "id": "m7",
            "question": "Factorize: x^2 - 9",
            "options": ["(x-3)(x-3)", "(x+3)(x-3)", "(x+9)(x-1)", "x(x-9)"],
            "correct_answer": "(x+3)(x-3)",
            "difficulty": 2,
            "concept": "Algebra",
            "hint": "Difference of two squares formula."
        },
        {
            "id": "m8",
            "question": "What is 20% of 150?",
            "options": ["30", "15", "50", "20"],
            "correct_answer": "30",
            "difficulty": 1,
            "concept": "Arithmetic",
            "hint": "10% is 15."
        },
        {
            "id": "m9",
            "question": "The quadratic formula solves equations of which form?",
            "options": ["y = mx + c", "ax^2 + bx + c = 0", "a^2 + b^2 = c^2", "E = mc^2"],
            "correct_answer": "ax^2 + bx + c = 0",
            "difficulty": 2,
            "concept": "Algebra",
            "hint": "Standard form of a quadratic equation."
        },
         {
            "id": "m10",
            "question": "Volume of a cube with side length 4 is?",
            "options": ["16", "64", "12", "32"],
            "correct_answer": "64",
            "difficulty": 1,
            "concept": "Geometry",
            "hint": "Volume = side³"
        },
        {
            "id": "m11",
            "question": "Solve the system: y = 2x, y = x + 3",
            "options": ["x=3, y=6", "x=1, y=2", "x=2, y=4", "x=0, y=3"],
            "correct_answer": "x=3, y=6",
            "difficulty": 3,
            "concept": "Systems of Equations",
            "hint": "Substitute y=2x into the second equation."
        },
        {
            "id": "m12",
            "question": "What is the derivative of x^2?",
            "options": ["x", "2x", "x^2", "2"],
            "correct_answer": "2x",
            "difficulty": 3,
            "concept": "Calculus",
            "hint": "Power rule: nx^(n-1)."
        },
        {
            "id": "m13",
            "question": "Sum of geometric sequence: 2, 4, 8, 16... (first 5 terms)",
            "options": ["32", "62", "30", "64"],
            "correct_answer": "62",
            "difficulty": 3,
            "concept": "Sequences",
            "hint": "2+4+8+16+32."
        },
        {
            "id": "m14",
            "question": "If sin(x) = 1, what is x (in degrees, 0-360)?",
            "options": ["0", "90", "180", "270"],
            "correct_answer": "90",
            "difficulty": 2,
            "concept": "Trigonometry",
            "hint": "Think of the unit circle y-coordinate."
        },
        {
            "id": "m15",
            "question": "Log base 10 of 1000 is?",
            "options": ["10", "100", "3", "1"],
            "correct_answer": "3",
            "difficulty": 2,
            "concept": "Logarithms",
            "hint": "10 to what power equals 1000?"
        }
    ],
    "data_science": [
        {
            "id": "ds1",
            "question": "Which Python library is primarily used for data manipulation and analysis?",
            "options": ["Pandas", "NumPy", "Matplotlib", "Scikit-learn"],
            "correct_answer": "Pandas",
            "difficulty": 1,
            "concept": "Libraries",
            "hint": "Think 'Panel Data'."
        },
        {
            "id": "ds2",
            "question": "What does a confusion matrix measure?",
            "options": ["Model performance", "Data sorting speed", "Memory usage", "Network latency"],
            "correct_answer": "Model performance",
            "difficulty": 2,
            "concept": "Evaluation Metrics",
            "hint": "It shows true positives, false positives, etc."
        },
        {
            "id": "ds3",
            "question": "Which of these is a supervised learning algorithm?",
            "options": ["K-Means Clustering", "Linear Regression", "Apriori", "DBSCAN"],
            "correct_answer": "Linear Regression",
            "difficulty": 1,
            "concept": "Machine Learning",
            "hint": "It predicts a continuous value based on labeled data."
        },
         {
            "id": "ds4",
            "question": "What is overfitting?",
            "options": ["Model performs well on training data but poor on test data", "Model performs poor on both", "Model is too simple", "Model is under-trained"],
            "correct_answer": "Model performs well on training data but poor on test data",
            "difficulty": 2,
            "concept": "Machine Learning",
            "hint": "The model memorizes the noise."
        },
        {
            "id": "ds5",
            "question": "In SQL, which clause is used to filter records?",
            "options": ["WHERE", "GROUP BY", "ORDER BY", "SELECT"],
            "correct_answer": "WHERE",
            "difficulty": 1,
            "concept": "SQL",
            "hint": "It specifies a condition while fetching data."
        }
    ],
    "electrical_engineering": [
        {
            "id": "ee1",
            "question": "What is the unit of electrical resistance?",
            "options": ["Ohm", "Volt", "Ampere", "Watt"],
            "correct_answer": "Ohm",
            "difficulty": 1,
            "concept": "Circuits",
            "hint": "Symbol is Ω."
        },
        {
            "id": "ee2",
            "question": "According to Ohm's Law, V = ?",
            "options": ["I * R", "I / R", "R / I", "I + R"],
            "correct_answer": "I * R",
            "difficulty": 1,
            "concept": "Circuits",
            "hint": "Voltage equals Current times Resistance."
        },
        {
            "id": "ee3",
            "question": "What component stores energy in a magnetic field?",
            "options": ["Inductor", "Capacitor", "Resistor", "Diode"],
            "correct_answer": "Inductor",
            "difficulty": 2,
            "concept": "Components",
            "hint": "Usually a coil of wire."
        },
        {
            "id": "ee4",
            "question": "In a parallel circuit, what remains constant across all components?",
            "options": ["Voltage", "Current", "Resistance", "Power"],
            "correct_answer": "Voltage",
            "difficulty": 2,
            "concept": "Circuits",
            "hint": "Parallel branches share the same potential difference."
        },
         {
            "id": "ee5",
            "question": "What does AC stand for?",
            "options": ["Alternating Current", "Analog Current", "Active Current", "Amplified Current"],
            "correct_answer": "Alternating Current",
            "difficulty": 1,
            "concept": "Basics",
            "hint": "Opposite of Direct Current."
        }
    ],
    "psychology": [
        {
            "id": "psy1",
            "question": "Which psychologist is famous for classical conditioning with dogs?",
            "options": ["Ivan Pavlov", "B.F. Skinner", "Sigmund Freud", "Carl Jung"],
            "correct_answer": "Ivan Pavlov",
            "difficulty": 1,
            "concept": "Behaviorism",
            "hint": "Think of the bells."
        },
        {
            "id": "psy2",
            "question": "What is the 'ID' in Freud's theory?",
            "options": ["Instinctual drives", "Moral conscience", "Rational self", "Social self"],
            "correct_answer": "Instinctual drives",
            "difficulty": 2,
            "concept": "Psychoanalysis",
            "hint": "It operates on the pleasure principle."
        },
        {
            "id": "psy3",
            "question": "Cognitive dissonance refers to?",
            "options": ["Mental discomfort from conflicting beliefs", "Memory loss", "Split personality", "High intelligence"],
            "correct_answer": "Mental discomfort from conflicting beliefs",
            "difficulty": 2,
            "concept": "Cognitive Psychology",
            "hint": "When actions don't match beliefs."
        },
        {
            "id": "psy4",
            "question": "The hierarchy of needs was proposed by?",
            "options": ["Abraham Maslow", "Jean Piaget", "Erik Erikson", "Albert Bandura"],
            "correct_answer": "Abraham Maslow",
            "difficulty": 1,
            "concept": "Humanistic Psychology",
            "hint": "It's a pyramid."
        },
        {
            "id": "psy5",
            "question": "What part of the brain is primarily responsible for memory?",
            "options": ["Hippocampus", "Cerebellum", "Occipital Lobe", "Brain Stem"],
            "correct_answer": "Hippocampus",
            "difficulty": 2,
            "concept": "Biological Psychology",
            "hint": "Looks like a seahorse."
        }
    ],
    "mechanical_engineering": [
        {
             "id": "phy1",
             "question": "Newton's Second Law is expressed as?",
             "options": ["F = ma", "F = mv", "E = mc^2", "v = d/t"],
             "correct_answer": "F = ma",
             "difficulty": 1,
             "concept": "Mechanics",
             "hint": "Force equals mass times acceleration."
        },
        {
             "id": "phy2",
             "question": "Which force opposes motion between surfaces?",
             "options": ["Friction", "Gravity", "Tension", "Normal Force"],
             "correct_answer": "Friction",
             "difficulty": 1,
             "concept": "Mechanics",
             "hint": "It generates heat when you rub hands together."
        },
        {
             "id": "phy3",
             "question": "What is the SI unit of energy?",
             "options": ["Joule", "Newton", "Watt", "Pascal"],
             "correct_answer": "Joule",
             "difficulty": 1,
             "concept": "Thermodynamics",
             "hint": "Same as work."
        },
        {
             "id": "phy4",
             "question": "Bernoulli's principle relates to?",
             "options": ["Fluid dynamics", "Electrical ciruits", "Planetary motion", "Atomic structure"],
             "correct_answer": "Fluid dynamics",
             "difficulty": 2,
             "concept": "Fluids",
             "hint": "Explains why airplanes fly."
        },
        {
             "id": "phy5",
             "question": "Torque is defined as?",
             "options": ["Rotational force", "Linear momentum", "Energy rate", "Mass density"],
             "correct_answer": "Rotational force",
             "difficulty": 2,
             "concept": "Rotational Mechanics",
             "hint": "It causes twisting."
        }
    ],
    "system_design": [
        {
            "id": "sd1", "difficulty": 1, "concept": "Load Balancing",
            "question": "What is the main purpose of a Load Balancer?",
            "options": ["Distribute traffic", "Store data", "Encrypt connection", "Cache images"],
            "correct_answer": "Distribute traffic", "hint": "Prevents server overload."
        },
        {
            "id": "sd2", "difficulty": 2, "concept": "CAP Theorem",
            "question": "In CAP Theorem, what does P stand for?",
            "options": ["Partition Tolerance", "Latency", "Persistence", "Performance"],
            "correct_answer": "Partition Tolerance", "hint": "System works despite network drops."
        }
    ],
    "web_dev": [
        {
            "id": "wd1", "difficulty": 1, "concept": "HTTP",
            "question": "Which HTTP method is idempotent?",
            "options": ["GET", "POST", "CONNECT", "PATCH"],
            "correct_answer": "GET", "hint": "Repeating it changes nothing."
        },
        {
            "id": "wd2", "difficulty": 1, "concept": "CSS",
            "question": "What does CSS stand for?",
            "options": ["Cascading Style Sheets", "Computer Style System", "Creative Style Sheet", "Colorful Style System"],
            "correct_answer": "Cascading Style Sheets", "hint": "It cascades."
        }
    ]
}

def get_question_by_difficulty(difficulty: int, exclude_ids: list = None, domain: str = "dsa"):
    if exclude_ids is None:
        exclude_ids = []
        
    questions = QUESTION_BANK.get(domain, [])
    
    candidates = [q for q in questions if q['difficulty'] == difficulty and q['id'] not in exclude_ids]
    if not candidates:
        # Fallback if no questions of exact difficulty, try adjacent
        candidates = [q for q in questions if q['id'] not in exclude_ids]
    
    if not candidates:
        return None # Finished mock bank
        
    import random
    return random.choice(candidates)
