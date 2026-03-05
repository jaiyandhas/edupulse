import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Zap, CheckCircle, Sparkles, ChevronRight, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api' });

export default function MasterTutor() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Default to 'Arrays' if no context provided (e.g. direct nav)
    const context = location.state?.context || "Data Structures";

    const [lessonContent, setLessonContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Auto-generate lesson on mount
        const generateLesson = async () => {
            setLoading(true);
            try {
                // We use the same 'chat' endpoint but treating it as a one-shot lesson generator
                // The 'context' param primes the AI to teach this topic.
                const res = await api.post('/tutor/chat', {
                    session_id: `lesson_${Date.now()}`, // New session per lesson
                    message: "Explain this topic thoroughly but concisely. Use an analogy if helpful.",
                    context: context
                });
                setLessonContent(res.data.message);
            } catch (err) {
                console.error("AI Tutor API Error:", err);
                if (err.response) {
                    console.error("Response Data:", err.response.data);
                    console.error("Response Status:", err.response.status);
                    setError(`Failed to generate lesson. Server responded with ${err.response.status}: ${JSON.stringify(err.response.data)}`);
                } else if (err.request) {
                    console.error("No response received:", err.request);
                    setError("Failed to connect to the server. Please check if the backend is running.");
                } else {
                    setError(`Error setting up request: ${err.message}`);
                }
            } finally {
                setLoading(false);
            }
        };

        if (context) {
            generateLesson();
        }
    }, [context]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-16 z-10 px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                        <BookOpen size={20} />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-indigo-600 uppercase tracking-wide">Current Module</div>
                        <h1 className="text-xl font-bold text-slate-900">{context}</h1>
                    </div>
                </div>

                {/* Search / Topic Switcher */}
                <div className="flex-1 max-w-md mx-4 hidden md:block">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const newTopic = e.target.topic.value;
                            if (newTopic) navigate('.', { state: { context: newTopic }, replace: true });
                        }}
                        className="relative"
                    >
                        <input
                            name="topic"
                            type="text"
                            placeholder="Change topic (e.g. Recursion)..."
                            className="w-full pl-4 pr-10 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
                        />
                        <button type="submit" className="absolute right-2 top-2 text-slate-400 hover:text-indigo-600">
                            <Sparkles size={16} />
                        </button>
                    </form>
                </div>

                <div className="md:hidden w-full order-last mt-2">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const newTopic = e.target.topic.value;
                            if (newTopic) navigate('.', { state: { context: newTopic }, replace: true });
                        }}
                        className="relative"
                    >
                        <input
                            name="topic"
                            type="text"
                            placeholder="Change topic..."
                            className="w-full pl-4 pr-10 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
                        />
                        <button type="submit" className="absolute right-2 top-2 text-slate-400 hover:text-indigo-600">
                            <Sparkles size={16} />
                        </button>
                    </form>
                </div>

                <div>
                    <button
                        onClick={() => navigate(`/learn/dsa/adaptive?concept=${encodeURIComponent(context)}`)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Zap size={18} /> Skip to Quiz
                    </button>
                </div>
            </div>

            <div className="flex-1 max-w-5xl mx-auto w-full p-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-96 space-y-6">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Sparkles size={20} className="text-indigo-600 animate-pulse" />
                            </div>
                        </div>
                        <div className="text-center">
                            <h2 className="text-lg font-semibold text-slate-800">Generating Personalized Lesson...</h2>
                            <p className="text-slate-500">Pulse AI is structuring the content for {context}</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-800 p-8 rounded-xl border border-red-200 text-center">
                        <h2 className="text-xl font-bold mb-2">Connection Error</h2>
                        <p>{error}</p>
                        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg">
                            Retry
                        </button>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Main Content (Textbook Style) */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200 prose prose-indigo prose-lg max-w-none prose-headings:text-indigo-900 prose-a:text-indigo-600 prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-1 prose-code:rounded">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {lessonContent}
                                </ReactMarkdown>
                            </div>
                        </div>

                        {/* Interactive Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
                                <div className="relative z-10">
                                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                                        <CheckCircle size={20} className="text-green-400" /> Lesson Complete?
                                    </h3>
                                    <p className="text-indigo-200 text-sm mb-6">
                                        Once you've grasped the concepts of <strong>{context}</strong>, put your knowledge to the test.
                                    </p>
                                    <button
                                        onClick={() => navigate(`/learn/dsa/adaptive?concept=${encodeURIComponent(context)}`)}
                                        className="w-full py-3 bg-white text-indigo-900 rounded-xl font-bold shadow-lg hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        Start Adaptive Quiz <ChevronRight size={18} />
                                    </button>
                                </div>
                                {/* Deco */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <h4 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">Key Takeaways</h4>
                                <ul className="space-y-3 text-sm text-slate-600">
                                    <li className="flex gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></div>
                                        Core definition and purpose
                                    </li>
                                    <li className="flex gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></div>
                                        Real-world application
                                    </li>
                                    <li className="flex gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></div>
                                        Common pitfalls & edge cases
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
