import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CTVAuthProvider, useCTVAuth } from '../../context/CTVAuthContext';
import CTVSidebar from './components/CTVSidebar';
import './ctv.css';

function CTVLayoutContent({ children }) {
    const { user, loading: authLoading } = useAuth();
    const { profile, loading: ctvLoading } = useCTVAuth();
    const navigate = useNavigate();

    // The CTV Auth Context manages grabbing the profile.
    const isLoading = authLoading || ctvLoading;

    useEffect(() => {
        if (!isLoading && !user) {
            navigate('/login');
        }
    }, [user, isLoading, navigate]);

    if (isLoading) {
        return (
            <div className="ctv-root">
                <div className="loading-overlay" style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
                    <div className="spinner" />
                    <span style={{ color: 'var(--text-muted)' }}>Loading CTV Arena...</span>
                </div>
            </div>
        );
    }

    if (!user) return null;

    // If a user doesn't have a CTV profile, you might want to force them to create one,
    // or just let them access it without a streak. For now, we continue.

    return (
        <div className="ctv-root">
            <div className="app-layout">
                <CTVSidebar />
                <main className="main-content">
                    {children}
                </main>
            </div>
        </div>
    );
}

// Ensure the CTV Auth Provider is wrapping the entire layout so all children can access `useCTVAuth`
export default function CTVLayout({ children }) {
    return (
        <CTVAuthProvider>
            <CTVLayoutContent>
                {children}
            </CTVLayoutContent>
        </CTVAuthProvider>
    );
}
