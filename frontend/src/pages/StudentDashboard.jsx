import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Target, Zap, Clock, Hash, LogOut, BookOpen, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api' });

export default function StudentDashboard({ openDiagnostic }) {
    const { user, profile, signOut, updateUserRole } = useAuth();
    const navigate = useNavigate();
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [joinCode, setJoinCode] = useState('');
    const [joining, setJoining] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [stats, setStats] = useState({ mastery: 0, streak: 0, total_time: 0 });

    // Profile Editing State
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');

    // Initialize edit name when profile loads
    useEffect(() => {
        if (profile?.full_name) setEditName(profile.full_name);
    }, [profile]);

    const handleUpdateProfile = async () => {
        try {
            await updateUserRole(profile.role, editName);
            setIsEditing(false);
            alert("Profile updated!");
        } catch (err) {
            console.error(err);
            alert("Failed to update profile");
        }
    };

    const fetchStats = async () => {
        if (!user) return;
        try {
            const res = await api.get(`/user/${user.id}/stats`);
            setStats(res.data);
        } catch (err) {
            console.error("Failed to fetch stats", err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchEnrollments();
            fetchStats();
        }
    }, [user?.id]);

    // ... (fetchEnrollments and joinClassroom stay the same)

    const fetchEnrollments = async () => {
        try {
            const { data, error } = await supabase
                .from('enrollments')
                .select('*, classrooms(name, teacher:profiles(full_name))')
                .eq('student_id', user.id);

            if (error) throw error;
            setEnrollments(data);
        } catch (error) {
            console.error('Error fetching enrollments:', error);
        } finally {
            setLoading(false);
        }
    };

    const joinClassroom = async (e) => {
        e.preventDefault();
        setErrorMsg(null);
        if (!joinCode.trim()) return;

        setJoining(true);
        try {
            // 1. Find the classroom
            const { data: classData, error: classError } = await supabase
                .from('classrooms')
                .select('id')
                .eq('join_code', joinCode.toUpperCase().trim())
                .single();

            if (classError || !classData) {
                throw new Error("Invalid Join Code");
            }

            // 2. Enroll
            const { error: enrollError } = await supabase
                .from('enrollments')
                .insert({
                    student_id: user.id,
                    classroom_id: classData.id
                });

            if (enrollError) {
                if (enrollError.code === '23505') throw new Error("You are already in this class");
                throw enrollError;
            }

            setJoinCode('');
            fetchEnrollments();
            alert("Successfully joined classroom!");
        } catch (err) {
            setErrorMsg(err.message || "Failed to join class");
        } finally {
            setJoining(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        {isEditing ? (
                            <div className="flex items-center gap-2">
                                <input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="border border-slate-300 rounded px-2 py-1 text-lg"
                                />
                                <button onClick={handleUpdateProfile} className="text-xs bg-green-500 text-white px-2 py-1 rounded">Save</button>
                                <button onClick={() => setIsEditing(false)} className="text-xs bg-slate-300 text-slate-700 px-2 py-1 rounded">Cancel</button>
                            </div>
                        ) : (
                            <>
                                Hello, {profile?.full_name || 'Student'}!
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="ml-3 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 font-medium"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                    Edit Profile
                                </button>
                            </>
                        )}
                    </h1>
                    <p className="text-slate-500">Track your learning journey and join classes.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Link to="/analytics-demo" className="text-indigo-600 hover:bg-indigo-50 border border-indigo-200 px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                        <Target size={18} /> Overall Analytics
                    </Link>
                    <button onClick={handleSignOut} className="text-slate-500 hover:text-red-600 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>
            </div>

            {/* Course Mastery Progress */}
            <div className="mb-10 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Target size={20} className="text-indigo-500" /> Course Mastery
                        </h2>
                        <p className="text-slate-500 text-sm">You're making great progress on your fundamentals!</p>
                    </div>
                    <span className="text-2xl font-bold text-indigo-600">{(stats.mastery * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${stats.mastery * 100}%` }}
                    ></div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Col: Stats & Join */}
                <div className="space-y-8">
                    {/* Access Card */}
                    <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200">
                        <h2 className="text-xl font-bold mb-4">Start Learning</h2>
                        <p className="text-indigo-100 mb-6 text-sm">Jump back into your personalized adaptive learning path.</p>
                        <div className="space-y-3">
                            <Link to="/domains" className="w-full bg-white text-indigo-600 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors">
                                <Zap size={20} /> Continue Learning
                            </Link>
                            <button
                                onClick={openDiagnostic}
                                className="w-full bg-indigo-700/50 text-white font-medium py-2 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors text-sm"
                            >
                                <Target size={16} /> Retake Diagnostic
                            </button>
                        </div>
                    </div>

                    {/* Join Class */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Hash size={20} className="text-indigo-500" /> Join a Classroom
                        </h3>
                        <form onSubmit={joinClassroom}>
                            <input
                                type="text"
                                placeholder="Enter 6-digit Code"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value)}
                                className="w-full p-3 rounded-lg border border-slate-200 mb-3 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                maxLength={6}
                            />
                            {errorMsg && (
                                <p className="text-red-500 text-xs mb-3 flex items-center gap-1">
                                    <AlertCircle size={12} /> {errorMsg}
                                </p>
                            )}
                            <button
                                type="submit"
                                disabled={joining || !joinCode}
                                className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
                            >
                                {joining ? 'Joining...' : 'Join Class'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Col: Classrooms & Progress */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Explore Domains Grid - NEW */}
                    <div>
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <BookOpen size={20} className="text-indigo-500" /> Explore Domains
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Link to="/domains/engineering/cs" className="p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 hover:shadow-md transition-all group">
                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Hash size={20} />
                                </div>
                                <h4 className="font-bold text-slate-800 text-sm">Computer Science</h4>
                                <p className="text-xs text-slate-500 mt-1">Algorithms & Data Structures</p>
                            </Link>

                            <Link to="/learn/school_math/adaptive" className="p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 hover:shadow-md transition-all group">
                                <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Zap size={20} />
                                </div>
                                <h4 className="font-bold text-slate-800 text-sm">Mathematics</h4>
                                <p className="text-xs text-slate-500 mt-1">Algebra & Calculus</p>
                            </Link>

                            <Link to="/learn/data_science/adaptive" className="p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 hover:shadow-md transition-all group">
                                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Target size={20} />
                                </div>
                                <h4 className="font-bold text-slate-800 text-sm">Data Science</h4>
                                <p className="text-xs text-slate-500 mt-1">ML & Analytics</p>
                            </Link>

                            <Link to="/learn/mechanical_engineering/adaptive" className="p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 hover:shadow-md transition-all group">
                                <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Target size={20} />
                                </div>
                                <h4 className="font-bold text-slate-800 text-sm">Physics (Mech)</h4>
                                <p className="text-xs text-slate-500 mt-1">Forces & Motion</p>
                            </Link>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                                <Zap size={24} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-900">{stats.streak}</div>
                                <div className="text-xs text-slate-500 uppercase font-semibold">Streak</div>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                <Clock size={24} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-900">{Math.floor(stats.total_time / 60)}m</div>
                                <div className="text-xs text-slate-500 uppercase font-semibold">Time Learned</div>
                            </div>
                        </div>
                    </div>

                    {/* Enrollments */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[300px]">
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="font-bold text-slate-900">Your Classrooms</h3>
                        </div>
                        {loading ? (
                            <div className="p-12 text-center text-slate-400">Loading...</div>
                        ) : enrollments.length === 0 ? (
                            <div className="p-12 text-center">
                                <BookOpen size={48} className="mx-auto text-slate-200 mb-4" />
                                <p className="text-slate-500">You haven't joined any classrooms yet.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {enrollments.map((enr) => (
                                    <div key={enr.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div>
                                            <h4 className="font-bold text-slate-800">{enr.classrooms.name}</h4>
                                            <p className="text-sm text-slate-500">Instructor: {enr.classrooms.teacher.full_name}</p>
                                        </div>
                                        <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-1 rounded-full">
                                            Active
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
