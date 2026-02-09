import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Brain, Activity, HelpCircle, ChevronRight, BarChart3, AlertCircle, ChevronLeft } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { useTelemetry } from '../hooks/useTelemetry';

// Configure Axios
const api = axios.create({
    baseURL: 'http://localhost:8000/api',
});

export default function AdaptiveQuiz() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const mode = searchParams.get('mode') || 'standard';
    const focusConcept = searchParams.get('concept');
    const MAX_QUESTIONS = 10;
    const params = useParams();
    const domainId = (params.domainId && params.domainId !== 'undefined') ? params.domainId : 'dsa';
    const [sessionId, setSessionId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // Added Error State
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const { telemetry, resetTelemetry } = useTelemetry();
    const [questionIndex, setQuestionIndex] = useState(0); // Track progress locally
    const [placementResult, setPlacementResult] = useState(null); // Store diagnostic result

    // State related to answering
    const [selectedOption, setSelectedOption] = useState(null);
    const [feedback, setFeedback] = useState(null); // { correct: bool, text: str, full_data: ... }
    const [startTime, setStartTime] = useState(Date.now());

    // RL Panel State
    const [isRLPanelOpen, setIsRLPanelOpen] = useState(true);
    const [rlData, setRlData] = useState(null);

    // Timer
    const [elapsed, setElapsed] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const timerRef = useRef(null);

    const sessionInitRef = useRef(false);

    useEffect(() => {
        if (user && !sessionInitRef.current) {
            sessionInitRef.current = true;
            startSession();
        }
        return () => clearInterval(timerRef.current);
    }, [user]);

    useEffect(() => {
        if (currentQuestion && !feedback) {
            setStartTime(Date.now());
            setElapsed(0);
            setIsTimerRunning(true);
        } else {
            setIsTimerRunning(false);
        }
    }, [currentQuestion, feedback]);

    useEffect(() => {
        if (isTimerRunning) {
            timerRef.current = setInterval(() => {
                setElapsed(prev => prev + 1);
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isTimerRunning]);

    const startSession = async () => {
        try {
            const res = await api.post('/session/start', {
                domain: domainId || 'dsa',
                user_id: user?.id,
                mode: mode,
                focus_concept: focusConcept
            });
            setSessionId(res.data.session_id);
            setQuestionIndex(0); // Reset progress on new session
            fetchNextQuestion(res.data.session_id);
        } catch (err) {
            console.error("Failed to start session", err);
            // Fix: Set error and stop loading
            setError(`Failed to initialize session: ${err.message || "Unknown error"}`);
            setLoading(false);
        }
    };

    const fetchNextQuestion = async (sid) => {
        try {
            setLoading(true);
            const res = await api.get(`/session/${sid}/next`);

            // Handle Completion
            if (res.data.status === 'complete') {
                if (res.data.mode === 'diagnostic') {
                    // Show Placement Result Screen instead of standard analytics
                    setPlacementResult(res.data);
                } else {
                    navigate(`/analytics/${sid}`);
                }
                return;
            }

            setCurrentQuestion(res.data.question);
            setSelectedOption(null);
            setFeedback(null);
        } catch (err) {
            console.error("Failed to fetch q", err);
            // Fix: Also set error here if next question fetch fails HARD
            setError(`Failed to fetch question: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedOption) return;

        // Stop timer immediately to capture precise user time
        if (timerRef.current) clearInterval(timerRef.current);
        setIsTimerRunning(false);

        const timeTaken = (Date.now() - startTime) / 1000;

        try {
            const res = await api.post('/session/submit', {
                session_id: sessionId,
                question_id: currentQuestion.id,
                answer: selectedOption,
                time_taken: timeTaken,
                telemetry: telemetry
            });

            // Reset for next question
            resetTelemetry();

            setFeedback({
                correct: res.data.correct,
                text: res.data.explanation, // This is actually the "Correct/Incorrect" text or hint in original (legacy)
                correct_answer: res.data.correct_answer,
                detailed_explanation: res.data.explanation // The new deep explanation
            });
            setRlData(res.data.rl_data);

            // Handle Smart Loop (Teach-Assess-Adjust)
            if (res.data.next_action) {
                const action = res.data.next_action;

                // Show toast/alert for now (In real app, a nice modal)
                alert(action.message);

                if (action.type === 'mastery_advance') {
                    // Redirect to next lesson
                    window.location.href = `/learn/${domainId}/adaptive?mode=lesson&concept=${action.next_concept}`;
                    return;
                } else if (action.type === 'remediate') {
                    // Redirect to remedial lesson
                    window.location.href = `/learn/${domainId}/adaptive?mode=lesson&concept=${action.prev_concept}`;
                    return;
                }
            }

            setQuestionIndex(prev => prev + 1);

        } catch (err) {
            console.error(err);
        }
    };

    const handleNext = () => {
        fetchNextQuestion(sessionId);
    };

    const [showContent, setShowContent] = useState(false);
    const lastConceptRef = useRef(null); // Track last seen concept

    // Trigger Content View ONLY when concept changes
    useEffect(() => {
        if (currentQuestion?.concept && currentQuestion.concept !== lastConceptRef.current) {
            // Only show if concept changed AND content exists
            if (currentQuestion.concept_content) {
                setShowContent(true);
            }
            lastConceptRef.current = currentQuestion.concept;
        }
        // Removed else block to prevent auto-closing on re-renders
    }, [currentQuestion?.id]);

    if (loading && !currentQuestion) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
                <div className="w-16 h-16 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4"></div>
                <p className="text-brand-500 animate-pulse">Initializing Adaptive Engine...</p>
            </div>
        );
    }



    // Diagnostic Placement Result Screen
    if (placementResult) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center border border-indigo-100 relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-indigo-500"></div>

                    <div className="mb-6 inline-flex p-4 rounded-full bg-indigo-50 text-indigo-600 mb-6 ring-4 ring-indigo-50/50">
                        <Activity size={48} />
                    </div>

                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Diagnostic Complete</h2>
                    <p className="text-slate-500 mb-8">We've analyzed your performance.</p>

                    <div className="bg-slate-50 rounded-xl p-6 mb-8 border border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Your Placement</p>
                        <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
                            {placementResult.placement}
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                            {placementResult.reason}
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => {
                                // Start new session with recommended difficulty
                                // By navigating to standard mode
                                window.location.href = `/learn/${domainId}/adaptive`;
                            }}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                        >
                            Start My Personalized Path <ChevronRight size={20} />
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="text-slate-400 hover:text-slate-600 text-sm font-medium py-2"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Add Error UI
    if (error) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
                <AlertCircle size={48} className="text-red-500 mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h3>
                <p className="text-slate-600 mb-6">{error}</p>
                <div className="flex gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-4 py-2 text-slate-600 hover:text-slate-900"
                    >
                        Go Dashboard
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn-primary"
                    >
                        Retry Session
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-4 gap-8">
            {/* Main Quiz Area */}
            <div className="lg:col-span-3 space-y-6">

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
                    <div
                        className="h-full bg-brand-500 transition-all duration-500 ease-out"
                        style={{ width: `${((questionIndex) / MAX_QUESTIONS) * 100}%` }}
                    ></div>
                </div>

                {/* Header Stats */}
                <div className="flex items-center justify-between text-brand-500 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700 mr-2">
                            Question {questionIndex + 1} / {MAX_QUESTIONS}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold
                            ${currentQuestion?.difficulty === 1 ? 'bg-green-100 text-green-700' :
                                currentQuestion?.difficulty === 2 ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'}
                         `}>
                            {currentQuestion?.difficulty === 1 ? 'Fundamental' :
                                currentQuestion?.difficulty === 2 ? 'Intermediate' : 'Advanced'} Level
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="flex items-center gap-1 capitalize"><Brain size={14} /> {currentQuestion?.concept}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                        <Clock size={16} /> {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')}
                    </div>
                </div>

                {/* Content Card (Concept First) */}
                <AnimatePresence mode="wait">
                    {showContent ? (
                        <motion.div
                            key="content-card"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white rounded-2xl p-10 min-h-[400px] flex flex-col justify-center items-center text-center shadow-xl border border-indigo-100 relative overflow-hidden"
                        >
                            {/* Decorator Background */}
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

                            <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-full mb-6 ring-4 ring-indigo-50 shadow-sm relative z-10">
                                <Brain size={48} className="text-indigo-600" />
                            </div>

                            <span className={`mb-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                ${currentQuestion?.difficulty === 1 ? 'bg-green-100 text-green-700' :
                                    currentQuestion?.difficulty === 2 ? 'bg-indigo-100 text-indigo-700' :
                                        'bg-purple-100 text-purple-700'}
                            `}>
                                {currentQuestion?.difficulty === 1 ? 'Fundamental Concept' :
                                    currentQuestion?.difficulty === 2 ? 'Intermediate Concept' : 'Advanced Concept'}
                            </span>

                            <h2 className="text-3xl font-bold text-slate-800 mb-4 capitalize">
                                {currentQuestion?.concept}
                            </h2>

                            <div className="max-w-2xl bg-indigo-50/50 p-6 rounded-xl border border-indigo-100 mb-8 backdrop-blur-sm">
                                <p className="text-lg text-slate-700 leading-relaxed font-medium">
                                    {currentQuestion?.concept_content}
                                </p>
                            </div>

                            <button
                                onClick={() => setShowContent(false)}
                                className="group relative px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    I Understand, I'm Ready <ChevronRight size={18} />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </button>
                        </motion.div>
                    ) : (
                        /* Standard Question Card */
                        <motion.div
                            key="question-card"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-2xl shadow-sm border border-brand-100 p-8 min-h-[400px] flex flex-col relative overflow-hidden"
                        >
                            <h2 className="text-xl font-medium text-brand-900 leading-relaxed mb-8">
                                {currentQuestion?.question}
                            </h2>

                            <div className="space-y-3 mb-8 flex-grow">
                                {currentQuestion?.options.map((opt, index) => {
                                    let statusClass = "border-brand-200 hover:bg-brand-50 hover:border-brand-300";
                                    if (feedback) {
                                        if (opt === feedback.correct_answer) statusClass = "bg-green-50 border-green-500 text-green-800";
                                        else if (opt === selectedOption && !feedback.correct) statusClass = "bg-red-50 border-red-300 text-red-800";
                                        else statusClass = "border-slate-100 opacity-50";
                                    } else if (selectedOption === opt) {
                                        statusClass = "bg-brand-50 border-brand-500 ring-1 ring-brand-500";
                                    }

                                    return (
                                        <button
                                            key={`${opt}-${index}`}
                                            onClick={() => !feedback && setSelectedOption(opt)}
                                            disabled={!!feedback}
                                            className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${statusClass}`}
                                        >
                                            {opt}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-brand-50">
                                {feedback ? (
                                    <div className="flex items-center gap-4 w-full justify-between">
                                        <div className={`flex items-center gap-2 text-sm ${feedback.correct ? 'text-green-600' : 'text-brand-600'}`}>
                                            {feedback.correct ? <span className="font-bold">Correct.</span> : <span className="font-bold text-red-600">Incorrect.</span>}
                                            {feedback.text}
                                            {feedback.detailed_explanation && (
                                                <div className="mt-2 text-sm font-normal text-slate-600 bg-white/50 p-3 rounded border border-brand-100 block w-full">
                                                    <span className="font-semibold text-brand-800 block mb-1">Explanation:</span>
                                                    {feedback.detailed_explanation}
                                                </div>
                                            )}
                                        </div>
                                        <button onClick={handleNext} className="btn-primary flex items-center gap-2">
                                            Next Concept <ChevronRight size={18} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex justify-end w-full">
                                        <button
                                            onClick={handleSubmit}
                                            disabled={!selectedOption}
                                            className={`btn-primary ${!selectedOption && 'opacity-50 cursor-not-allowed'}`}
                                        >
                                            Submit Answer
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Intelligence Panel */}
            <div className="lg:col-span-1">
                <div className="hud-panel rounded-xl overflow-hidden sticky top-24 border border-slate-700/50 shadow-2xl">
                    <div className="p-4 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Activity size={16} className="text-cyan-400 animate-pulse" />
                            <span className="font-mono text-xs font-bold tracking-widest uppercase text-cyan-400">System.Active</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></div>
                            <span className="text-[10px] text-slate-500 font-mono">LIVE_STREAM</span>
                        </div>
                    </div>

                    <div className="p-5 space-y-8 font-mono text-xs">
                        {/* Status Block */}
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-3 border-b border-slate-800 pb-1">Inferred State Vectors</p>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center group">
                                    <span className="text-slate-400 group-hover:text-slate-200 transition-colors">MASTERY_SCORE</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-cyan-500 transition-all duration-500"
                                                style={{ width: `${(rlData ? parseFloat(rlData.state_vector[0]) : 0) * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-cyan-400 min-w-[3ch] text-right">{rlData ? rlData.state_vector[0] : "0.00"}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400">EMOTION_STATE</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] border ${rlData?.state_vector[1] === "Frustrated" ? "border-red-500/30 text-red-400 bg-red-500/10" :
                                        rlData?.state_vector[1] === "Engaged" ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" :
                                            "border-slate-500/30 text-slate-400"
                                        }`}>
                                        {rlData ? rlData.state_vector[1].toUpperCase() : "ANALYZING..."}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Decision Block */}
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-3 border-b border-slate-800 pb-1">Reinforcement Engine</p>
                            {rlData ? (
                                <motion.div
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={JSON.stringify(rlData)} // Force re-animate on update
                                    className="space-y-2"
                                >
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">POLICY_ACTION</span>
                                        <span className="text-yellow-400 font-bold">{rlData.action.replace(" ", "_").toUpperCase()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Q_REWARD_VAL</span>
                                        <span className={`${rlData.reward >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {rlData.reward > 0 ? '+' : ''}{rlData.reward.toFixed(2)}
                                        </span>
                                    </div>

                                    {/* Dual-Objective Stats */}
                                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800">
                                        <div>
                                            <span className="text-[10px] text-slate-500 block">EFFICIENCY</span>
                                            <span className="text-emerald-400 font-bold">{rlData.efficiency ? rlData.efficiency.toFixed(1) : '-'}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-slate-500 block">ENGAGEMENT</span>
                                            <span className="text-purple-400 font-bold">{rlData.engagement ? rlData.engagement.toFixed(1) : '-'}</span>
                                        </div>
                                    </div>

                                    {/* System Insight */}
                                    <div className="mt-3 text-[10px] text-slate-400 bg-slate-900/80 p-2 rounded border border-slate-700/50 leading-relaxed">
                                        <span className="text-cyan-500 font-bold block mb-1"> SYSTEM_INSIGHT</span>
                                        {rlData.insight || "Analyzing interaction patterns..."}
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="text-slate-600 italic">Waiting for input...</div>
                            )}
                        </div>

                        <div className="pt-2 text-[9px] text-slate-600 text-center opacity-50">
                            EDUPULSE v0.9 // RL_MODEL_ACTIVE
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

