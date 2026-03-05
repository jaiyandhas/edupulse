import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Landing from './pages/Landing';
import Domains from './pages/Domains';
import TopicSelection from './pages/TopicSelection';
import AdaptiveQuiz from './pages/AdaptiveQuiz';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import MasterTutor from './pages/MasterTutor';

import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// CTV Imports
import CTVLayout from './pages/ctv/CTVLayout';
import CTVDashboard from './pages/ctv/CTVDashboard';
import CTVPractice from './pages/ctv/CTVPractice';
import CTVBookmarks from './pages/ctv/CTVBookmarks';
import CTVHistory from './pages/ctv/CTVHistory';
import CTVAdmin from './pages/ctv/CTVAdmin';

function PrivateRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    return user ? children : <Login />;
}

function Header() {
    const { user } = useAuth();
    return (
        <header className="fixed w-full top-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-xl border-b border-indigo-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                        EduPulse
                    </span>
                </Link>
                <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
                    {user ? (
                        <>
                            <Link to="/domains" className="hover:text-indigo-600 transition-colors">Learn</Link>
                            <Link to="/tutor" className="hover:text-cyan-600 transition-colors font-semibold flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span> AI Tutor
                            </Link>
                            <Link to="/ctv" className="hover:text-amber-500 transition-colors font-semibold flex items-center gap-1 text-amber-600">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                                CTV Arena
                            </Link>
                            <Link to="/dashboard" className="hover:text-indigo-600 transition-colors">Dashboard</Link>
                            <div className="h-4 w-px bg-slate-200"></div>
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs ring-2 ring-white shadow-sm">
                                {user.email?.[0].toUpperCase()}
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-slate-600 hover:text-slate-900 transition-colors">
                                Log in
                            </Link>
                            <Link to="/login" className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30">
                                Get Started
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-brand-50">
                    <Header />
                    <div className="h-16"></div> {/* Spacer for fixed header */}

                    <main className="flex-grow">
                        <Routes>
                            <Route path="/" element={<Landing />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/dashboard" element={
                                <PrivateRoute>
                                    <Dashboard />
                                </PrivateRoute>
                            } />
                            <Route path="/domains" element={
                                <PrivateRoute>
                                    <Domains />
                                </PrivateRoute>
                            } />
                            <Route path="/tutor" element={
                                <PrivateRoute>
                                    <MasterTutor />
                                </PrivateRoute>
                            } />
                            <Route path="/domains/engineering/cs" element={
                                <PrivateRoute>
                                    <TopicSelection />
                                </PrivateRoute>
                            } />
                            <Route path="/learn/:domainId/adaptive" element={
                                <PrivateRoute>
                                    <AdaptiveQuiz />
                                </PrivateRoute>
                            } />
                            <Route path="/analytics/:sessionId" element={
                                <PrivateRoute>
                                    <AnalyticsDashboard />
                                </PrivateRoute>
                            } />

                            {/* CTV Routes */}
                            <Route path="/ctv" element={<PrivateRoute><CTVLayout><CTVDashboard /></CTVLayout></PrivateRoute>} />
                            <Route path="/ctv/dashboard" element={<PrivateRoute><CTVLayout><CTVDashboard /></CTVLayout></PrivateRoute>} />
                            <Route path="/ctv/practice" element={<PrivateRoute><CTVLayout><CTVPractice /></CTVLayout></PrivateRoute>} />
                            <Route path="/ctv/bookmarks" element={<PrivateRoute><CTVLayout><CTVBookmarks /></CTVLayout></PrivateRoute>} />
                            <Route path="/ctv/history" element={<PrivateRoute><CTVLayout><CTVHistory /></CTVLayout></PrivateRoute>} />
                            <Route path="/ctv/admin" element={<PrivateRoute><CTVLayout><CTVAdmin /></CTVLayout></PrivateRoute>} />

                            {/* Fallback route for demo analytics */}
                            <Route path="/analytics-demo" element={<AnalyticsDashboard demoMode={true} />} />
                        </Routes>
                    </main>

                    <footer className="bg-white border-t border-slate-200 text-slate-500 py-12 mt-20">
                        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
                            <div className="flex items-center gap-2 mb-4 opacity-80">
                                <span className="font-bold tracking-tight text-slate-700">EduPulse</span>
                            </div>
                            <p className="opacity-60 text-sm">© 2024 EduPulse Inc. All rights reserved.</p>
                        </div>
                    </footer>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
