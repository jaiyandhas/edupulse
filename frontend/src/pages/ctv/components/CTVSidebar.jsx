import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useCTVAuth } from '../../../context/CTVAuthContext';
import { Sparkles, BrainCircuit, LayoutDashboard, Bookmark, History, Settings2, LogOut } from 'lucide-react';

const navItems = [
    { href: '/ctv/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { href: '/ctv/practice', label: 'Practice Mode', icon: <BrainCircuit size={18} /> },
    { href: '/ctv/bookmarks', label: 'Retry Later', icon: <Bookmark size={18} /> },
    { href: '/ctv/history', label: 'History', icon: <History size={18} /> },
    { href: '/ctv/admin', label: 'Admin Panel', adminOnly: true, icon: <Settings2 size={18} /> },
];

export default function CTVSidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { signOut } = useAuth();
    const { profile } = useCTVAuth();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    // Note: profile.role determines admin access for CTV. If not present, default to student view.
    const visibleItems = navItems.filter(item => !item.adminOnly || profile?.role === 'admin');

    return (
        <aside className="sidebar">


            <nav className="sidebar-nav">
                <div className="sidebar-section-label">Navigation</div>
                {visibleItems.map(item => {
                    const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                        >
                            {item.icon}
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="sidebar-bottom">
                {profile && (
                    <div style={{ marginBottom: 12, padding: '10px 12px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                            {profile.name}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {profile.register_number || profile.role}
                        </div>
                    </div>
                )}

                <Link to="/dashboard" className="btn btn-secondary btn-sm" style={{ width: '100%', marginBottom: '8px', color: 'var(--text-primary)' }}>
                    Back to EduPulse
                </Link>

                <button onClick={handleSignOut} className="btn btn-ghost btn-sm" style={{ width: '100%' }}>
                    <LogOut size={16} />
                    Sign Out
                </button>
                <div style={{ marginTop: 12, textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    <span>🍊 Built with orange juice & poor decisions</span>
                    <br />
                    <span style={{ color: 'var(--accent-light)', fontWeight: 600 }}>Jaiyandh A S</span>
                    <span style={{ color: 'var(--text-muted)' }}> · 23CDR060</span>
                </div>
            </div>
        </aside>
    );
}
