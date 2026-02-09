import uuid
from model.questions import get_question_by_difficulty
from model.emotion import EmotionInferenceEngine
from model.rl_engine import RLEngine
from services.llm_service import get_llm_service
from model.knowledge_graph import get_kt_service
from services.reporting_service import ReportingService

class SessionManager:
    def __init__(self):
        self.sessions = {}
        self.emotion_engine = EmotionInferenceEngine()
        self.rl_engine = RLEngine()
        self.llm_service = get_llm_service()
        self.kt_service = get_kt_service()
        self.reporting_service = ReportingService(report_dir="reports")
        
    def create_session(self, domain="dsa", user_id=None, interests=None, mode="standard", focus_concept=None):
        session_id = str(uuid.uuid4())
        
        # Initialize Knowledge State for this session (In real app, load from DB for user_id)
        k_state = self.kt_service.initialize_user_state(domain)
        
        # Normalize keys
        if domain == "math": domain = "school_math"
        
        self.sessions[session_id] = {
            "user_id": user_id,
            "domain": domain,
            "interests": interests or [],
            "knowledge_state": k_state, # Track granular mastery
            "history": [],
            "current_difficulty": 1, # Start easy
            "mastery_score": 0.0,
            "q_table_snapshot": None, # For debug panel
            "rl_active": True, # Default ON
            "last_action": "Init",
            "last_reward": 0,
            "last_state_idx": None,
            "last_action_idx": None,
            "last_action_idx": None,
            "active_question": None, # Store current dynamic question context
            "mode": mode,
            "focus_concept": focus_concept,
            "sticky_concept": None, # Logic to prevent jumping
            "sticky_count": 0
        }
        return session_id

    def get_user_stats(self, user_id):
        if not user_id: return None
        
        user_sessions = [s for s in self.sessions.values() if s.get('user_id') == user_id]
        if not user_sessions:
            return {
                "streak": 0,
                "total_time": 0,
                "mastery": 0,
                "questions_answered": 0
            }
            
        total_time = 0
        total_questions = 0
        total_mastery = 0
        
        for s in user_sessions:
            s_time = sum(h['time_taken'] for h in s['history'])
            total_time += s_time
            total_questions += len(s['history'])
            total_mastery += s['mastery_score']
            
        avg_mastery = total_mastery / len(user_sessions) if user_sessions else 0
        
        return {
            "streak": len(user_sessions), # Simple streak: number of sessions
            "total_time": total_time, # Seconds
            "mastery": avg_mastery,
            "questions_answered": total_questions
        }

    def get_class_analytics(self, teacher_id: str):
        """
        Aggregates data to find weak students for a teacher.
        Mocking: Since we don't have a real SQL DB with Teacher->Student relations in this memory-only SessionManager,
        we will just return ALL mock user sessions disguised as a "Class".
        """
        # 1. Group sessions by User
        user_performance = {}
        
        # --- MOCK DATA INJECTION (If no real sessions exist) ---
        if not self.sessions:
            user_performance = {
                "student_001": {
                    "sessions": 5, "total_mastery": 2.1, 
                    "concepts": {"arrays": [0.8, 0.9], "recursion": [0.4, 0.3], "trees": [0.2]}
                },
                "student_002": {
                    "sessions": 3, "total_mastery": 0.9,
                    "concepts": {"linked_lists": [0.5], "pointers": [0.2, 0.1]}
                },
                "student_003": {
                    "sessions": 8, "total_mastery": 6.4,
                    "concepts": {"graphs": [0.7], "dp": [0.6]}
                },
                "student_004": {
                    "sessions": 2, "total_mastery": 0.5,
                    "concepts": {"sorting": [0.3], "hashing": [0.4]}
                }
            }
        # -------------------------------------------------------

        for s in self.sessions.values():
            uid = s.get('user_id') or "Guest_User"
            if uid not in user_performance:
                user_performance[uid] = {
                    "sessions": 0,
                    "total_mastery": 0, 
                    "concepts": {}
                }
            
            u_data = user_performance[uid]
            u_data['sessions'] += 1
            u_data['total_mastery'] += s['mastery_score']
            
            # Track concept weakness (Mocking concept data from history)
            # In real system, this comes from KnowledgeState
            k_state = s['knowledge_state']
            if k_state and hasattr(k_state, 'mastery_probs'):
                for concept, score in k_state.mastery_probs.items():
                    if concept not in u_data['concepts']:
                        u_data['concepts'][concept] = []
                    u_data['concepts'][concept].append(score)

        # 2. Analyze Weaknesses
        at_risk_students = []
        
        for uid, data in user_performance.items():
            avg_mastery = data['total_mastery'] / data['sessions']
            
            # Identify specific weak concepts (Average score < 0.4)
            weak_concepts = []
            for concept, scores in data['concepts'].items():
                avg_conept_score = sum(scores) / len(scores)
                if avg_conept_score < 0.5:
                     weak_concepts.append(concept)
            
            # If overall mastery is low OR they have specific weak spots
            if avg_mastery < 0.6 or weak_concepts:
                at_risk_students.append({
                    "student_id": uid,
                    "name": f"Student {uid[:4]}", # Mock Name
                    "overall_mastery": round(avg_mastery, 2),
                    "weak_concepts": list(set(weak_concepts)), # Dedupe
                    "status": "Critical" if avg_mastery < 0.4 else "Needs Attention"
                })
                
        return {
            "total_students": len(user_performance),
            "at_risk_count": len(at_risk_students),
            "at_risk_list": at_risk_students
        }

    def get_next_question(self, session_id):
        MAX_QUESTIONS = 10
        session = self.sessions.get(session_id)
        if not session: return None
        
        # 0. Session Limit Check
        is_diagnostic = session.get('mode') == 'diagnostic'
        limit = 5 if is_diagnostic else 10
        
        if len(session['history']) >= limit:
            if is_diagnostic:
                # Calculate Placement
                correct_count = sum(1 for q in session['history'] if q['is_correct'])
                total = len(session['history'])
                score = correct_count / total if total > 0 else 0
                
                if score >= 0.8: 
                    placement = "Advanced"
                    diff = 3
                    reason = "Excellent mastery of core concepts. Ready for complex challenges."
                elif score >= 0.5: 
                    placement = "Intermediate"
                    diff = 2
                    reason = "Good grasp of fundamentals, but some gaps in application."
                else: 
                    placement = "Foundation"
                    diff = 1
                    reason = "Let's build strong fundamentals before moving to advanced topics."
                    
                return {
                    "status": "complete",
                    "mode": "diagnostic",
                    "placement": placement,
                    "recommended_difficulty": diff,
                    "reason": reason,
                    "score_percent": int(score * 100)
                }
            return {"status": "complete"}
            
        exclude_ids = [entry['question_id'] for entry in session['history']]
        
        exclude_ids = [entry['question_id'] for entry in session['history']]
        
        # 1. Knowledge Tracing: What concept should we target?
        k_state = session['knowledge_state']
        
        # PRIORITY: Focus Concept (Context Continuity)
        # If the user came from a specific lesson (e.g. Recursion), force that concept for the first 3 questions
        focus_concept = session.get('focus_concept')
        if focus_concept and len(session['history']) < 3:
            target_concept = focus_concept
        
        # DIAGNOSTIC MODE: Force specific broad concepts to calibrate
        elif session.get('mode') == 'diagnostic' and len(session['history']) < 5:
             # Fast track: 5 questions covering key pillars
             diagnostic_path = ['arrays', 'linked_lists', 'sorting', 'trees', 'graphs'] # Simple mocked path for DSA
             if session.get('domain') == 'school_math':
                 diagnostic_path = ['integers', 'fractions', 'geometry_basics', 'algebra_basics', 'statistics']
                 
             idx = len(session['history'])
             if idx < len(diagnostic_path):
                 target_concept = diagnostic_path[idx]
             else:
                 target_concept = self.kt_service.get_next_recommended_concept(k_state, session.get('domain', 'dsa'))
        else:
             # STICKY LOGIC: Prevent jumping
             current_sticky = session.get('sticky_concept')
             current_count = session.get('sticky_count', 0)
             
             # If we have a sticky concept and haven't asked 3 questions yet, stick with it.
             # UNLESS the last question triggered a "Mastery Advance" or "Remediate" action (which clears stickiness externally if we wanted, but here we just check count)
             # Actually, the 'next_action' in submit_answer is a directive for the FRONTEND. 
             # The backend needs to respect that flow. 
             # If the user stays in the session, we should probably stick until mastery.
             
             if current_sticky and current_count < 3:
                 target_concept = current_sticky
             else:
                 # Time to pick a new one (or keep the same if KT says so)
                 target_concept = self.kt_service.get_next_recommended_concept(k_state, session.get('domain', 'dsa'))
                 
                 # Reset sticky if it changed
                 if target_concept != current_sticky:
                     session['sticky_concept'] = target_concept
                     session['sticky_count'] = 0
             
             # Increment count happens when we successfully generate
             session['sticky_count'] += 1
        
        # 2. Generative AI with Targeted Concept
        question = self.llm_service.generate_question(
            domain=session.get('domain', 'dsa'),
            difficulty=session['current_difficulty'],
            concept=target_concept,
            interests=session.get('interests', [])
        )
        
        # Fallback to static bank if AI fails (though Mock won't) or if we want specific static Qs
        if not question:
            question = get_question_by_difficulty(
                session['current_difficulty'], 
                exclude_ids, 
                domain=session.get('domain', 'dsa')
            )
        
        if not question:
            return {"status": "complete"}
            
        # Store for validation
        session['active_question'] = question
            
        return {
            "status": "active",
            "question": question
        }

    def submit_answer(self, session_id, question_id, answer, time_taken, telemetry=None):
        session = self.sessions.get(session_id)
        if not session: return None
        
        # 1. Evaluate Authenticity
        from model.questions import QUESTION_BANK
        
        # Check if it was a dynamic question
        q_data = None
        active_q = session.get('active_question')
        
        if active_q and active_q['id'] == question_id:
            q_data = active_q
        else:
            # Fallback to static bank lookup (Legacy support)
            domain_questions = QUESTION_BANK.get(session.get('domain', 'dsa'), [])
            q_data = next((q for q in domain_questions if q['id'] == question_id), None)
            
        if not q_data:
            print(f"Error: Question {question_id} not found in session or bank.")
            return None
        
        is_correct = (answer == q_data['correct_answer'])
        
        # 2. Update Emotion
        log_entry = {
            "question_id": question_id,
            "time_taken": time_taken,
            "is_correct": is_correct,
            "difficulty": q_data['difficulty'],
            "telemetry": telemetry or {},
            # Placeholders for RL metrics, populated after calc
            "efficiency": 0,
            "engagement": 0,
            "total_reward": 0
        }
        session['history'].append(log_entry)
        
        emotion = self.emotion_engine.infer_emotion(session['history'])
        emotion_idx = self.emotion_engine.get_numeric_state(emotion)
        
        # 3. Knowledge Update (Granular)
        concept_id = q_data.get('concept', 'general') # Ensure questions have concept tags
        # Map nice names "Array Basics" to IDs "arrays" if needed, 
        # but better to store ID in question. For now, assume q_data['concept'] is the ID or Name.
        # In MockLLMService, we return the nice name/key. Let's assume strict mapping later.
        # For this prototype: strict mapping might fail if strings don't match, so just pass whatever we have.
        
        # Update BKT
        new_mastery_prob = self.kt_service.update_mastery(
            session['knowledge_state'], 
            concept_id, 
            is_correct
        )
        
        # 4. RL Update (Streamlined via RLEngine.step)
        # Prepare Context
        current_mastery = self.calculate_mastery(session['history'])
        session['mastery_score'] = current_mastery
        
        rl_context = {
            "mastery": current_mastery,
            "emotion": emotion,
            "emotion_idx": emotion_idx,
            "current_difficulty": session['current_difficulty'],
            "is_correct": is_correct,
            "time_taken": time_taken,
            "q_difficulty": q_data['difficulty'],
            "prev_state_idx": session.get('last_state_idx'),
            "prev_action_idx": session.get('last_action_idx')
        }
        
        # Execute RL Step
        rl_result = self.rl_engine.step(rl_context)
        
        # Update Session State with Results
        session['history'][-1]['efficiency'] = rl_result['metrics']['efficiency']
        session['history'][-1]['engagement'] = rl_result['metrics']['engagement']
        session['history'][-1]['total_reward'] = rl_result['reward']
        
        session['last_state_idx'] = rl_result['state_snapshot']
        session['last_action_idx'] = rl_result['action_idx']
        session['last_action'] = rl_result['action']
        session['last_reward'] = rl_result['reward']
        session['emotion'] = emotion
        
        # Apply Action (Difficulty Change)
        diff_change = rl_result['diff_change']
        
        if session['rl_active']:
            # STRICT Business Rule: "Right -> Up, Wrong -> Down"
            # The User explicitly requested this behavior.
            
            if is_correct:
                 # Aggressive Promotion
                 new_diff = min(3, session['current_difficulty'] + 1)
                 session['last_action'] = "Increase Difficulty (Promotion)"
                 
            else:
                 # Aggressive Demotion
                 new_diff = max(1, session['current_difficulty'] - 1)
                 session['last_action'] = "Decrease Difficulty (Remedial)"
                 
            session['current_difficulty'] = new_diff
        else:
             # Static Progression Logic
            if is_correct and session['current_difficulty'] < 3:
                session['current_difficulty'] += 1
        
        # 5. Concept Mastery Check (The "Loop")
        next_action = None
        
        # Get recent history for this concept (last 3 questions)
        concept_history = [h for h in session['history'] if h.get('difficulty') == q_data['difficulty']]
        recent_performance = concept_history[-3:]
        
        if len(recent_performance) >= 3:
             correct_count = sum(1 for h in recent_performance if h['is_correct'])
             
             # MASTERY CONDITION: 3/3 correct at current difficulty
             if correct_count == 3:
                 if session['current_difficulty'] >= 3:
                     # Concept Mastered! Move to next.
                     path_data = self.llm_service.get_concept_path(session.get('domain', 'dsa'), q_data.get('concept'))
                     if path_data.get('advance'):
                         next_action = {
                             "type": "mastery_advance",
                             "next_concept": path_data['advance'],
                             "message": f"Mastered {q_data.get('concept')}! Advancing to {path_data['advance']}."
                         }
                 else:
                     # Increase Difficulty (Internal promotion is already handled by RL above, but we can explicit signal)
                     pass

             # REMEDIATION CONDITION: 0/3 correct
             elif correct_count == 0:
                 path_data = self.llm_service.get_concept_path(session.get('domain', 'dsa'), q_data.get('concept'))
                 next_action = {
                     "type": "remediate",
                     "prev_concept": path_data['remediate'],
                     "message": f"Let's reinforce the basics of {path_data['remediate']} before moving on."
                 }

        return {
            "correct": is_correct,
            "correct_answer": q_data['correct_answer'],
            "explanation": q_data.get('explanation') or q_data.get('hint') or "No explanation provided.",
            "next_action": next_action, # Logic for Frontend to Redirect
            "rl_data": {
                "state_vector": [f"{current_mastery:.2f}", emotion, f"Diff: {q_data['difficulty']}"],
                "reward": rl_result['reward'],
                "efficiency": rl_result['metrics']['efficiency'],
                "engagement": rl_result['metrics']['engagement'],
                "insight": rl_result['insight'],
                "action": session['last_action'],
                "next_difficulty": session['current_difficulty']
            }
        }

    def calculate_mastery(self, history):
        if not history: return 0.0
        weighted_score = 0
        total_weight = 0
        for entry in history:
            w = entry['difficulty']
            if entry['is_correct']:
                weighted_score += w
            total_weight += w
        return weighted_score / total_weight if total_weight > 0 else 0
