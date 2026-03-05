import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Copy, Users, Plus, BookOpen, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TeacherDashboard() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newClassName, setNewClassName] = useState('');
    const [creating, setCreating] = useState(false);

    const [analytics, setAnalytics] = useState(null);

    useEffect(() => {
        fetchClassrooms();
        fetchAnalytics();
    }, [user.id]);

    const fetchAnalytics = async () => {
        try {
            // Fetch from our new Python backend endpoint
            // In dev, assuming backend is at :8000
            const baseUrl = import.meta.env.VITE_API_URL ? (import.meta.env.VITE_API_URL.endsWith('/api') ? import.meta.env.VITE_API_URL : `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`) : 'http://localhost:8000/api';
            const response = await fetch(`${baseUrl}/teacher/${user.id}/analytics`);
            if (response.ok) {
                const data = await response.json();
                setAnalytics(data);
            }
        } catch (error) {
            console.error("Failed to fetch analytics", error);
        }
    }

    const fetchClassrooms = async () => {
        try {
            const { data, error } = await supabase
                .from('classrooms')
                .select('*, enrollments(count)')
                .eq('teacher_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setClassrooms(data);
        } catch (error) {
            console.error('Error fetching classrooms:', error);
        } finally {
            setLoading(false);
        }
    };

    const createClassroom = async (e) => {
        e.preventDefault();
        if (!newClassName.trim()) return;

        setCreating(true);
        try {
            // Generate a simple 6-char code
            const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

            const { error } = await supabase
                .from('classrooms')
                .insert({
                    teacher_id: user.id,
                    name: newClassName,
                    join_code: joinCode
                });

            if (error) throw error;
            setNewClassName('');
            fetchClassrooms();
        } catch (error) {
            alert('Failed to create classroom');
            console.error(error);
        } finally {
            setCreating(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Teacher Dashboard</h1>
                    <p className="text-slate-500">Manage classrooms and intervene with at-risk students.</p>
                </div>
                <button onClick={handleSignOut} className="text-slate-500 hover:text-red-600 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">
                    <LogOut size={18} /> Sign Out
                </button>
            </div>

            {/* Analytics Alert Panel */}
            {analytics && analytics.at_risk_list?.length > 0 && (
                <div className="mb-10 bg-red-50 border border-red-100 rounded-xl p-6">
                    <h2 className="text-red-800 font-bold text-lg mb-4 flex items-center gap-2">
                        <Users size={20} /> Students Needing Intervention ({analytics.at_risk_count})
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {analytics.at_risk_list.map((student, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-lg border border-red-100 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-semibold text-slate-700">{student.name}</span>
                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-bold">
                                        {student.status.toUpperCase()}
                                    </span>
                                </div>
                                <div className="text-sm text-slate-500 mb-3">
                                    Overall Mastery: <span className={(student.overall_mastery || 0) < 0.4 ? "text-red-600 font-bold" : "text-slate-700"}>
                                        {((student.overall_mastery || 0) * 100).toFixed(0)}%
                                    </span>
                                </div>
                                {student.weak_concepts?.length > 0 && (
                                    <div>
                                        <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-1">Struggling With:</span>
                                        <div className="flex flex-wrap gap-1">
                                            {student.weak_concepts.map(c => (
                                                <span key={c} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">
                                                    {c}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Create Class Section */}
            <div className="bg-white p-6 rounded-xl border border-indigo-100 shadow-sm mb-10">
                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Plus size={20} className="text-indigo-600" /> Create New Classroom
                </h2>
                <form onSubmit={createClassroom} className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Class Name (e.g. AP Computer Science A)"
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                        className="flex-1 p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                    <button
                        type="submit"
                        disabled={creating || !newClassName}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        {creating ? 'Creating...' : 'Create Class'}
                    </button>
                </form>
            </div>

            {/* Classrooms Grid */}
            <h2 className="text-xl font-bold text-slate-900 mb-6">Your Classrooms</h2>
            {loading ? (
                <div className="text-center py-12 text-slate-400">Loading classrooms...</div>
            ) : classrooms.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500">You haven't created any classrooms yet.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classrooms.map((cls) => (
                        <div key={cls.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-slate-800 mb-2">{cls.name}</h3>
                                <div className="flex items-center gap-2 text-slate-500 text-sm mb-6">
                                    <Users size={16} />
                                    <span>{cls.enrollments?.[0]?.count || 0} Students Enrolled</span>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-lg flex items-center justify-between border border-slate-100">
                                    <div>
                                        <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-1">Join Code</span>
                                        <span className="font-mono text-lg font-bold text-indigo-600 tracking-wider">{cls.join_code}</span>
                                    </div>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(cls.join_code)}
                                        className="p-2 hover:bg-white rounded-md transition-colors text-slate-400 hover:text-indigo-600"
                                        title="Copy Code"
                                    >
                                        <Copy size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
