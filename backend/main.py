from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from services.session import SessionManager
from services.gemini_service import GeminiService
from services.diagnostic_service import get_diagnostic_service

app = FastAPI(title="EduPulse API", description="Adaptive Learning Engine Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

session_manager = SessionManager()
tutor_service = GeminiService()
diagnostic_service = get_diagnostic_service()

class StartSessionRequest(BaseModel):
    domain: str = "dsa"
    user_id: Optional[str] = None
    interests: List[str] = []
    mode: str = "standard" # standard, diagnostic
    focus_concept: Optional[str] = None

class AnswerRequest(BaseModel):
    session_id: str
    question_id: str
    answer: str
    time_taken: float
    telemetry: dict = {}

@app.get("/")
async def root():
    return {"message": "EduPulse Intelligence Engine Operational"}

@app.post("/api/session/start")
async def start_session(req: StartSessionRequest = None):
    # Default to DSA if not provided
    domain = req.domain if req else "dsa"
    user_id = req.user_id if req else None
    
    session_id = session_manager.create_session(
        domain=domain, 
        user_id=user_id,
        interests=req.interests,
        mode=req.mode,
        focus_concept=req.focus_concept
    )
    return {"session_id": session_id}

@app.get("/api/session/{session_id}/next")
async def get_next_question(session_id: str):
    result = session_manager.get_next_question(session_id)
    if not result:
        raise HTTPException(status_code=404, detail="Session not found")
    return result

@app.post("/api/session/submit")
async def submit_answer(req: AnswerRequest):
    result = session_manager.submit_answer(
        req.session_id, 
        req.question_id, 
        req.answer, 
        req.time_taken,
        req.telemetry
    )
    if not result:
        raise HTTPException(status_code=404, detail="Session error")
    return result

@app.get("/api/session/{session_id}/stats")
async def get_stats(session_id: str):
    session = session_manager.sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    return {
        "mastery": session['mastery_score'],
        "history": session['history'],
        "current_difficulty": session['current_difficulty']
    }

@app.get("/api/user/{user_id}/stats")
async def get_user_stats(user_id: str):
    stats = session_manager.get_user_stats(user_id)
    return stats

@app.get("/api/teacher/{teacher_id}/analytics")
async def get_teacher_analytics(teacher_id: str):
    # Retrieve aggregated class weakness data
    analytics = session_manager.get_class_analytics(teacher_id)
    return analytics

class ChatRequest(BaseModel):
    session_id: str
    message: str
    context: str = None

@app.post("/api/tutor/chat")
async def chat_with_tutor(req: ChatRequest):
    response = tutor_service.send_message(req.session_id, req.message, req.context)
    return {"message": response}

@app.get("/api/content/lesson/{domain}/{concept}")
async def get_lesson_content(domain: str, concept: str):
    """
    Fetches the static/AI lesson content for a specific concept.
    """
    # Use the LLM Service (Hybrid) to fetch content
    from services.llm_service import get_llm_service
    srv = get_llm_service()
    return srv.get_lesson_content(domain, concept)

class DiagnosticRequest(BaseModel):
    courses: list[str]

class DiagnosticSubmitRequest(BaseModel):
    user_id: str
    results: list[dict] # {question_id, correct, course, concept}

@app.post("/api/diagnostic/questions")
async def get_diagnostic_questions(req: DiagnosticRequest):
    questions = diagnostic_service.generate_diagnostic_questions(req.courses)
    return {"questions": questions}

@app.post("/api/diagnostic/submit")
async def submit_diagnostic(req: DiagnosticSubmitRequest):
    analysis = diagnostic_service.analyze_results(req.user_id, req.results)
    
    # Optional: Update Knowledge Graph immediately here?
    # For now, just return the analysis so FE can show the "Profile Generated" screen
    return {"analysis": analysis, "profile_path": f"user_profiles/{req.user_id}_knowledge_profile.md"}
