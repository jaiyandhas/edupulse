import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { CheckCircle, Award, TrendingUp, Home, Sparkles, ArrowRight } from 'lucide-react';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api' });

export default function AnalyticsDashboard({ demoMode = false }) {
    const { sessionId } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(!demoMode);

    useEffect(() => {
        if (demoMode) {
            // Generate mock data for demo
            const mockHistory = Array.from({ length: 15 }, (_, i) => ({
                question_id: i,
                difficulty: 1 + Math.min(2, i * 0.2 + Math.random() * 0.5), // Increasing difficulty
                is_correct: Math.random() > 0.3,
                time_taken: 10 + Math.random() * 20
            }));
            setData({
                mastery: 0.78,
                history: mockHistory,
                current_difficulty: 3
            });
            setLoading(false);
        } else {
            const fetchData = async () => {
                try {
                    const res = await api.get(`/session/${sessionId}/stats`);
                    setData(res.data);
                } catch (err) {
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [sessionId, demoMode]);

    if (loading) return <div className="p-12 text-center text-brand-500">Generating Analytics Report...</div>;
    if (!data) return <div className="p-12 text-center text-red-500">Could not load session data.</div>;

    // Prepare chart data
    const chartData = data.history.map((h, i) => ({
        question: i + 1,
        difficulty: h.difficulty,
        // Simulate a "Static" curve that would have stayed flat or linear
        static_model: 1 + (i * 0.05),
        adaptive_model: h.difficulty,
        correct: h.is_correct ? 1 : 0
    }));

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="mb-12 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-brand-900 mb-2">Learning Session Analytics</h1>
                    <p className="text-brand-500">Deep dive into your cognitive performance and adaptive path.</p>
                </div>
                <Link to="/" className="btn-secondary flex items-center gap-2">
                    <Home size={16} /> Return Home
                </Link>
            </div>
            {/* Next Steps / Recommendation Engine */}
            <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-xl p-8 mb-12 text-white flex items-center justify-between shadow-2xl border border-indigo-500/30 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2 text-indigo-300 font-mono text-xs uppercase tracking-widest">
                        <Sparkles size={14} /> AI Curriculum Recommendations
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Recommended Focus: {data.weakest_concept || 'Arrays & Hashing'}</h2>
                    <p className="text-indigo-100/80 max-w-xl">
                        Based on your diagnostic, we detected a gap in this area.
                        Let's start by building a strong conceptual foundation with the AI Tutor.
                    </p>
                </div>
                <Link
                    to="/tutor"
                    state={{ context: data.weakest_concept || 'Arrays & Hashing' }}
                    className="relative z-10 bg-white text-indigo-900 px-6 py-3 rounded-lg font-bold hover:bg-indigo-50 transition-colors shadow-lg flex items-center gap-2 group"
                >
                    Start AI Lesson <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                {/* Decorative BG */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full -mr-16 -mt-16"></div>
            </div>

            {/* KPI Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white p-6 rounded-xl border border-brand-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                        <Award size={24} />
                    </div>
                    <div>
                        <div className="text-sm text-slate-500 uppercase tracking-wide">Final Mastery</div>
                        <div className="text-2xl font-bold text-brand-900">{(data.mastery * 100).toFixed(1)}%</div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-brand-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-brand-600 rounded-full flex items-center justify-center">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <div className="text-sm text-slate-500 uppercase tracking-wide">Peak Difficulty</div>
                        <div className="text-2xl font-bold text-brand-900">Level {data.current_difficulty}</div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-brand-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <div className="text-sm text-slate-500 uppercase tracking-wide">Accuracy Rate</div>
                        <div className="text-2xl font-bold text-brand-900">
                            {((data.history.filter(h => h.is_correct).length / data.history.length) * 100).toFixed(0)}%
                        </div>
                    </div>
                </div>
            </div>

            {/* Adaptive vs Static Graph */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white p-6 rounded-xl border border-brand-100 shadow-sm">
                    <h3 className="font-semibold text-brand-900 mb-6">Adaptive Efficiency vs. Static Baseline</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorSplit" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3182ce" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3182ce" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="question" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="adaptive_model"
                                    name="Adaptive Path (RL)"
                                    stroke="#3182ce"
                                    strokeWidth={3}
                                    fill="url(#colorSplit)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="static_model"
                                    name="Static Linear"
                                    stroke="#cbd5e0"
                                    strokeDasharray="5 5"
                                    fill="none"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-slate-400 mt-4 text-center">
                        The blue curve shows how EduPulse adjusted real-time difficulty compared to a standard linear progression.
                    </p>
                </div>

                {/* Dual-Objective Optimization Landscape */}
                <div className="bg-white p-6 rounded-xl border border-brand-100 shadow-sm col-span-1 lg:col-span-2">
                    <h3 className="font-semibold text-brand-900 mb-6">Dual-Objective Optimization: Learning Efficiency + Engagement</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.history}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="question_id" stroke="#94a3b8" />
                                <YAxis yAxisId="left" stroke="#10b981" label={{ value: 'Efficiency', angle: -90, position: 'insideLeft' }} />
                                <YAxis yAxisId="right" orientation="right" stroke="#8b5cf6" label={{ value: 'Engagement', angle: 90, position: 'insideRight' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Line yAxisId="left" type="monotone" dataKey="efficiency" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Learning Efficiency" />
                                <Line yAxisId="right" type="monotone" dataKey="engagement" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} name="Engagement Stability" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Accuracy Trend */}
                <div className="bg-white p-6 rounded-xl border border-brand-100 shadow-sm">
                    <h3 className="font-semibold text-brand-900 mb-6">Cognitive Load Response (Time vs Correctness)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.history}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" label={{ value: 'Seconds', angle: -90, position: 'insideLeft' }} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="time_taken" name="Response Time" fill="#829ab1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex gap-4 justify-center text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-brand-400 rounded"></div> Response Time
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
