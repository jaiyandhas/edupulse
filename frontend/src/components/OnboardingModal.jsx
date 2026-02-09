import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Code, Calculator, ArrowRight, CheckCircle, Brain, FileText } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const api = axios.create({ baseURL: 'http://localhost:8000/api' });

export default function OnboardingModal({ isOpen, onClose }) {
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [selectedDomains, setSelectedDomains] = useState([]);

    // Diagnostic State
    const [questions, setQuestions] = useState([]);
    const [currentQIdx, setCurrentQIdx] = useState(0);
    const [results, setResults] = useState([]); // {question_id, correct, course, concept}
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);

    const domains = [
        { id: 'dsa', name: 'Data Structures', icon: <Code size={24} />, color: 'bg-indigo-500' },
        { id: 'math', name: 'Mathematics', icon: <Calculator size={24} />, color: 'bg-emerald-500' },
        { id: 'system_design', name: 'System Design', icon: <BookOpen size={24} />, color: 'bg-orange-500' },
        { id: 'web_dev', name: 'Web Development', icon: <FileText size={24} />, color: 'bg-blue-500' },
    ];

    const toggleDomain = (id) => {
        if (selectedDomains.includes(id)) {
            setSelectedDomains(prev => prev.filter(d => d !== id));
        } else {
            setSelectedDomains(prev => [...prev, id]);
        }
    };

    const startDiagnostic = async () => {
        setLoading(true);
        try {
            const res = await api.post('/diagnostic/questions', { courses: selectedDomains });
            setQuestions(res.data.questions);
            setStep(3); // Questions View
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const answerQuestion = (opt) => {
        const q = questions[currentQIdx];
        const isCorrect = (opt === q.correct_answer);

        const newResult = {
            question_id: q.id,
            difficulty: q.difficulty,
            course: q.course,
            concept: q.concept,
            correct: isCorrect
        };

        setResults(prev => [...prev, newResult]);

        if (currentQIdx < questions.length - 1) {
            setCurrentQIdx(prev => prev + 1);
        } else {
            submitDiagnostic([...results, newResult]);
        }
    };

    const submitDiagnostic = async (finalResults) => {
        setLoading(true);
        try {
            const res = await api.post('/diagnostic/submit', {
                user_id: user?.email?.split('@')[0] || 'guest',
                results: finalResults
            });
            setAnalysis(res.data.analysis);
            setStep(4); // Results View
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="bg-indigo-600 p-6 text-white shrink-0">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <BookOpen size={24} /> Learning Journey
                        </h2>
                        <p className="text-indigo-100 mt-2 text-sm opacity-90">
                            {step === 4 ? "Profile Generated" : "Personalize your experience"}
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-8 overflow-y-auto">
                        {step === 1 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-slate-800">What do you want to master today? (Select all that apply)</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {domains.map((d) => (
                                        <button
                                            key={d.id}
                                            onClick={() => toggleDomain(d.id)}
                                            className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all group ${selectedDomains.includes(d.id)
                                                ? 'border-indigo-600 bg-indigo-50'
                                                : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className={`p-3 rounded-lg text-white shadow-sm ${d.color} ${selectedDomains.includes(d.id) ? 'scale-110' : ''}`}>
                                                {d.icon}
                                            </div>
                                            <span className={`font-semibold text-lg ${selectedDomains.includes(d.id) ? 'text-indigo-700' : 'text-slate-700'
                                                }`}>
                                                {d.name}
                                            </span>
                                            {selectedDomains.includes(d.id) && (
                                                <CheckCircle className="ml-auto text-indigo-600" size={20} />
                                            )}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    disabled={selectedDomains.length === 0}
                                    onClick={() => setStep(2)}
                                    className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                                >
                                    Continue <ArrowRight size={18} />
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="text-center space-y-6">
                                {/* Intro to diagnostic */}
                                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                    <Brain size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">Diagnostic Questionnaire</h3>
                                <p className="text-slate-600">
                                    We'll ask a few questions for <strong>{selectedDomains.join(' & ')}</strong> to analyze your current knowledge.
                                </p>
                                <button
                                    onClick={startDiagnostic}
                                    disabled={loading}
                                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                                >
                                    {loading ? "Generating..." : "Start Analysis"}
                                </button>
                            </div>
                        )}

                        {step === 3 && questions.length > 0 && (
                            <div className="space-y-6">
                                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    <span>Question {currentQIdx + 1} / {questions.length}</span>
                                    <span>{questions[currentQIdx].course}</span>
                                </div>
                                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-500 transition-all duration-300"
                                        style={{ width: `${((currentQIdx + 1) / questions.length) * 100}%` }}
                                    />
                                </div>

                                <h3 className="text-lg font-medium text-slate-900 leading-relaxed">
                                    {questions[currentQIdx].question}
                                </h3>

                                <div className="space-y-3">
                                    {questions[currentQIdx].options.map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => answerQuestion(opt)}
                                            className="w-full p-4 rounded-lg border border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 text-left transition-colors"
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 4 && analysis && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold text-sm mb-4">
                                        <CheckCircle size={16} /> Analysis Complete
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900">Your Knowledge Profile</h3>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                                    <div>
                                        <span className="text-xs font-bold text-slate-500 uppercase">Weak Areas (Focus Here)</span>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {analysis.weaknesses.length > 0 ? (
                                                analysis.weaknesses.map(w => (
                                                    <span key={w} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium border border-red-200">
                                                        {w}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-slate-400">None detected!</span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-slate-500 uppercase">Strong Areas</span>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {analysis.strengths.length > 0 ? (
                                                analysis.strengths.map(s => (
                                                    <span key={s} className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium border border-emerald-200">
                                                        {s}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-slate-400">None yet</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 border border-indigo-100 bg-indigo-50/50 rounded-lg flex items-center gap-3">
                                    <FileText className="text-indigo-500" size={20} />
                                    <div className="text-sm text-indigo-900">
                                        <strong>Profile Saved.</strong> A markdown report has been generated for your instructor.
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        // Save personalization locally for immediate dashboard adaptation
                                        if (analysis) {
                                            localStorage.setItem('user_interests', JSON.stringify(selectedDomains));
                                            localStorage.setItem('user_mastery', JSON.stringify(analysis.baseline_mastery));

                                            // Also simulate a user session start event if needed
                                            console.log("Personalization applied:", analysis);
                                        }
                                        onClose();
                                    }}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all"
                                >
                                    Enter Dashboard
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
