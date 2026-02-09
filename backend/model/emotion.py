import random

class EmotionInferenceEngine:
    """
    Infers user emotional state based on behavioral metrics.
    States: 0: Engaged, 1: Bored, 2: Frustrated, 3: Stable/Neutral
    """
    
    def infer_emotion(self, recent_logs):
        """
        recent_logs: List of dictionary containing:
            - time_taken (seconds)
            - is_correct (bool)
        """
        if not recent_logs:
            return "Stable"

        last_entry = recent_logs[-1]
        time_taken = last_entry.get("time_taken", 10)
        is_correct = last_entry.get("is_correct", False)
        telemetry = last_entry.get("telemetry", {})
        
        # Extract Telemetry Signals
        rage_clicks = telemetry.get('rageClicks', 0)
        tab_switches = telemetry.get('tabSwitches', 0)
        mouse_dist = telemetry.get('mouseDistance', 0)
        
        # 1. Frustration Detection (High Priority)
        # Explicit rage clicks are a strong signal
        if rage_clicks > 0:
            return "Frustrated"
            
        # Traditional: Incorrect AND (Long time OR repeated errors)
        if not is_correct and time_taken > 60:
            return "Frustrated"
            
        consecutive_errors = 0
        for log in reversed(recent_logs):
            if not log['is_correct']:
                consecutive_errors += 1
            else:
                break
        if consecutive_errors >= 2:
            return "Frustrated"

        # 2. Boredom/Distraction
        # Tab switching means they are leaving the app
        if tab_switches > 0:
            return "Bored"
            
        # Too fast (guessing)
        if time_taken < 2:
            return "Bored"

        # 3. Flow State Detection
        # Consistent correct answers, reasonable speed, low distraction
        if is_correct and 3 < time_taken < 25 and tab_switches == 0:
            # Check previous if available
            if len(recent_logs) > 1 and recent_logs[-2]['is_correct']:
                 return "Flow"

        # 4. Engagement (Default positive)
        if is_correct:
            return "Engaged"
            
        return "Stable"

    def get_numeric_state(self, mood):
        mapping = {
            "Engaged": 0,
            "Bored": 1,
            "Frustrated": 2,
            "Stable": 3,
            "Flow": 4 # New State
        }
        return mapping.get(mood, 3)
