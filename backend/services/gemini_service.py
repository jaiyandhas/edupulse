import os
import time
import random
from typing import Optional

try:
    import google.generativeai as genai
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False
    print("Warning: google.generativeai not found. Running in Offline Mode.")

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("Warning: python-dotenv not found.")

class GeminiService:
    def __init__(self):
        # Load API Key from Environment
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model = None
        self.primary_model_name = 'gemini-1.5-flash'
        
        if HAS_GENAI and self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
            
            print(f"GeminiService: Online and Ready (gemini-2.5-flash).")
        else:
             print("GeminiService: API Key missing or Library not found. AI features disabled.")
             
        self.chat_sessions = {} # session_id -> chat_object
        self.response_cache = {} # prompt -> response_text
        self.cache_capacity = 100 # LRU size

    def _generate_with_retry(self, func, *args, **kwargs) -> Optional[str]:
        """
        Executes a generation function with exponential backoff retry logic.
        """
        max_retries = 3
        base_delay = 2
        
        for attempt in range(max_retries):
            try:
                result = func(*args, **kwargs)
                return result.text if hasattr(result, 'text') else str(result)
            except Exception as e:
                error_str = str(e).lower()
                is_quota = "429" in error_str or "quota" in error_str or "exhausted" in error_str
                
                if is_quota and attempt < max_retries - 1:
                    sleep_time = (base_delay * (2 ** attempt)) + (random.random() * 0.5)
                    print(f"Gemini Quota Exceeded. Retrying in {sleep_time:.2f}s... (Attempt {attempt+1}/{max_retries})")
                    time.sleep(sleep_time)
                    continue
                else:
                    # If it's the last attempt or not a retryable error, re-raise or return None
                    if attempt == max_retries - 1:
                        print(f"Gemini Action Failed after {max_retries} attempts: {e}")
                    raise e
        return None

    def get_chat(self, session_id, context=None):
        if not self.model: return None # Offline
        
        if session_id not in self.chat_sessions:
            # Start new chat with pedagogical system prompt
            system_instruction = "You are 'Pulse', an expert AI Tutor. Your goal is to EDUCATE first. When a student asks about a topic, explain it clearly, use analogies (e.g. Minecraft, Space, Cars based on their interests if known), and check for understanding. ONLY after you are sure they understand, suggest a quiz. Do not give the answer to quiz questions directly if asked later."
            
            if context:
                system_instruction += f" The student has explicitly chosen to learn: '{context}'. Start by asking what they know about {context} or giving a brief hook."
            
            # Using history=[] effectively starts a new chat
            self.chat_sessions[session_id] = self.model.start_chat(history=[])
            
            # Seed the system behavior silently
            try:
                # We don't need retry strictly for the seeding message, but good practice
                self.chat_sessions[session_id].send_message(system_instruction)
            except Exception as e:
                print(f"Failed to seed chat system instruction: {e}")
            
        return self.chat_sessions[session_id]

    def send_message(self, session_id, message, context=None):
        chat = self.get_chat(session_id, context)
        if not chat: return "AI Tutor is offline (Check API Key)"
        
        try:
            # Check Cache
            cache_key = f"{session_id}|{message}"
            if cache_key in self.response_cache:
                return self.response_cache[cache_key]

            # Send Message with Retry
            text_response = self._generate_with_retry(chat.send_message, message)
            
            if text_response:
                # Cache
                self.response_cache[cache_key] = text_response
                return text_response
            return "I'm having trouble thinking right now. Please try again."
            
        except Exception as e:
            print(f"Primary model failed: {e}. Attempting fallbacks...")
            fallback_models = ['gemini-2.0-flash', 'gemini-flash-latest'] # Updated fallbacks
            
            for model_name in fallback_models:
                try:
                    print(f"Fallback: Trying {model_name}...")
                    fallback_model = genai.GenerativeModel(model_name)
                    # One-shot fallback
                    full_prompt = f"System: You are an AI Tutor. Context: {context or 'General'}. User: {message}"
                    
                    response = self._generate_with_retry(fallback_model.generate_content, full_prompt)
                    if response:
                        return response
                except Exception as fb_e:
                    print(f"Fallback {model_name} failed: {fb_e}")
                    continue
            
            # Final Fallback: Mock Mode (to prevent app breakage)
            print("All online models failed. Engaging Mock Mode.")
            return self._get_mock_response(message, context)

    def _get_mock_response(self, message, context):
        """Returns a simulated response when online services are unavailable."""
        msg_lower = message.lower()
        if "hello" in msg_lower or "hi" in msg_lower:
            return "Hello! I am currently running in offline mode due to high traffic, but I can still help you with basic concepts. What would you like to learn?"
        if "explain" in msg_lower:
            return f"I see you want an explanation about {context or 'this topic'}. In offline mode, I can tell you that {context or 'this concept'} is a fundamental building block in the subject. (Please retry later for a full AI explanation)."
        return f"I am currently in offline mode due to high server load (Quota Exceeded). I received your message: '{message}'. Please try again in 24 hours when my energy recharges!"

    def generate_content(self, prompt: str):
        if not self.model: return None
        try:
            return self._generate_with_retry(self.model.generate_content, prompt)
        except Exception as e:
            print(f"Gemini Gen Error: {e}")
            return "Content generation unavailable (Quota Exceeded)."

_llm_instance = None
def get_llm_service():
    global _llm_instance
    if not _llm_instance:
        _llm_instance = GeminiService()
    return _llm_instance
