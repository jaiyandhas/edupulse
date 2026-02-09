import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, GraduationCap, Mail, Lock, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
    const { user, role, signInWithEmail, signUpWithEmail, updateUserRole } = useAuth();

    // Auth State
    const [mode, setMode] = useState('login'); // 'login' | 'signup'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Profile Setup State
    const [selectedRole, setSelectedRole] = useState(null);
    const [name, setName] = useState('');
    const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);

    // 1. If user is fully authenticated and has a role, redirect to dashboard
    if (user && role) {
        return <Navigate to="/dashboard" replace />;
    }

    // 2. Profile Setup Step (for new users via Google or Email)
    if (user && !role) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-panel p-8 rounded-2xl max-w-md w-full"
                >
                    <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">Complete Your Profile</h2>
                    <p className="text-slate-500 text-sm text-center mb-8">Tell us how you'll be using EduPulse</p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <button
                            onClick={() => setSelectedRole('student')}
                            className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${selectedRole === 'student'
                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500'
                                : 'border-slate-200 text-slate-500 hover:border-indigo-200 hover:bg-white'
                                }`}
                        >
                            <GraduationCap size={32} />
                            <span className="font-semibold">Student</span>
                        </button>
                        <button
                            onClick={() => setSelectedRole('teacher')}
                            className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${selectedRole === 'teacher'
                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500'
                                : 'border-slate-200 text-slate-500 hover:border-indigo-200 hover:bg-white'
                                }`}
                        >
                            <Users size={32} />
                            <span className="font-semibold">Teacher</span>
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Jane Doe"
                                className="w-full p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            />
                        </div>

                        <button
                            onClick={() => {
                                setIsSubmittingProfile(true);
                                updateUserRole(selectedRole, name).catch(err => {
                                    console.error(err);
                                    alert(`Failed to update profile: ${err.message}`); // Temporary feedback
                                    setIsSubmittingProfile(false);
                                });
                            }}
                            disabled={!selectedRole || !name || isSubmittingProfile}
                            className={`w-full btn-primary py-3 ${(!selectedRole || !name) && 'opacity-50 cursor-not-allowed'}`}
                        >
                            {isSubmittingProfile ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 size={18} className="animate-spin" /> Setting up...
                                </span>
                            ) : 'Continue to Dashboard'}
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // 3. Login / Sign Up Form
    const handleAuth = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            if (mode === 'signup') {
                const { session } = await signUpWithEmail(email, password);
                if (!session) {
                    // Start of handling for email confirmation flow
                    setError("Account created! Please check your email to confirm.");
                    setIsLoading(false);
                    return;
                }
            } else {
                await signInWithEmail(email, password);
            }
            // If we have a session (login success or auto-login signup), the AuthContext 
            // will look update `user` and trigger the redirect steps above.
            // We can leave isLoading=true while that happens.
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
            {/* Background Blooms */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            </div>

            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-8 md:p-10 rounded-3xl max-w-md w-full relative z-10 shadow-2xl"
            >
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-500/30 mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {mode === 'login' ? 'Enter your credentials to access your account' : 'Start your adaptive learning journey today'}
                    </p>
                </div>

                {/* Integration Error Warning */}
                {window.location.hash.includes('error') && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 flex items-start gap-3">
                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                        <div>
                            <span className="font-semibold block">Authentication Error</span>
                            Login was unsuccessful. Please try again.
                        </div>
                    </div>
                )}

                {/* Main Auth Form */}
                <form onSubmit={handleAuth} className="space-y-4">
                    {error && (
                        <div className={`p-3 text-sm rounded-lg flex items-center gap-2 ${error.includes('Account created')
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-600'
                            }`}>
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 uppercase ml-1">Email Address</label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                placeholder="name@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 uppercase ml-1">Password</label>
                        <div className="relative">
                            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full btn-primary py-3.5 rounded-xl group relative overflow-hidden"
                    >
                        {isLoading ? (
                            <Loader2 size={20} className="animate-spin mx-auto" />
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                {mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={18} className="opacity-70 group-hover:translate-x-1 transition-transform" />
                            </span>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-slate-500 text-sm">
                        {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                        <button
                            onClick={() => {
                                setMode(mode === 'login' ? 'signup' : 'login');
                                setError(null);
                            }}
                            className="ml-2 font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                            {mode === 'login' ? 'Sign up' : 'Log in'}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
