import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth as useEduPulseAuth } from './AuthContext';
import { ctvSupabase } from '../lib/ctvSupabase';

const CTVAuthContext = createContext();

export function CTVAuthProvider({ children }) {
    // We re-use the EduPulse Auth session, no double login needed
    const { user, session, loading: eduLoading } = useEduPulseAuth();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId) => {
        try {
            const { data, error } = await ctvSupabase
                .from('student_profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (data) {
                setProfile(data);
            } else {
                // If profile doesn't exist yet, we might want to create a blank one or just leave as null
                setProfile(null);
            }
        } catch (error) {
            console.error("CTV Auth Context Error:", error);
        }
    };

    const refreshProfile = async () => {
        if (user) {
            await fetchProfile(user.id);
        }
    };

    useEffect(() => {
        // Only run CTV profile fetch after EduPulse auth finishes
        if (!eduLoading) {
            if (user) {
                fetchProfile(user.id).finally(() => setLoading(false));
            } else {
                setProfile(null);
                setLoading(false);
            }
        }
    }, [user, eduLoading]);

    // SignOut falls back to the EduPulse auth if needed, or we just rely on EduPulse's global sign out
    const ctvSignOut = async () => {
        setProfile(null);
    };

    // total loading is either EduPulse loading OR CTV fetching profile loading
    const isTotalLoading = eduLoading || loading;

    return (
        <CTVAuthContext.Provider value={{ user, session, profile, loading: isTotalLoading, refreshProfile, ctvSignOut }}>
            {children}
        </CTVAuthContext.Provider>
    );
}

export const useCTVAuth = () => useContext(CTVAuthContext);
