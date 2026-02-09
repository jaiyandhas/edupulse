import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import StudentDashboard from './StudentDashboard';
import TeacherDashboard from './TeacherDashboard';
import OnboardingModal from '../components/OnboardingModal';

export default function Dashboard() {
    const { role } = useAuth();
    // Check if user has already onboarded
    // Check if user has already onboarded
    // Defaulting to false to prevent annoyance. User can trigger via button.
    const [showOnboarding, setShowOnboarding] = useState(false);

    const handleOnboardingClose = () => {
        localStorage.setItem('has_onboarded', 'true');
        setShowOnboarding(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full"
        >
            {role === 'teacher' ? (
                <TeacherDashboard />
            ) : (
                <StudentDashboard openDiagnostic={() => setShowOnboarding(true)} />
            )}

            {/* Onboarding Modal - Only for Students */}
            {role !== 'teacher' && (
                <OnboardingModal
                    isOpen={showOnboarding}
                    onClose={handleOnboardingClose}
                />
            )}
        </motion.div>
    );
}
