import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Brain, Zap, BarChart2, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const FeatureCard = ({ icon: Icon, title, desc }) => (
    <div className="glass-card p-8 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-100/50 to-transparent rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
        <div className="w-14 h-14 bg-gradient-to-br from-brand-50 to-brand-100 rounded-xl flex items-center justify-center text-brand-600 mb-6 shadow-inner ring-1 ring-white/50">
            <Icon size={28} />
        </div>
        <h3 className="text-xl font-bold text-brand-900 mb-3">{title}</h3>
        <p className="text-brand-600 text-sm leading-relaxed font-medium">{desc}</p>
    </div>
);

export default function Landing() {
    return (
        <div className="space-y-32 pb-32">
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-28 pb-20 lg:pt-40 lg:pb-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 max-w-5xl mx-auto leading-tight">
                            AI-Based Live Tutor for <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-brand-600 to-accent-DEFAULT">
                                K-12 Students
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
                            EduPulse creates a personalized curriculum in real-time, adapting difficulty and detecting student emotions to maintain the perfect learning flow.
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
                            <Link to="/domains" className="btn-primary flex items-center justify-center gap-3 text-lg group">
                                Start Learning <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <button className="btn-secondary flex items-center justify-center gap-2 text-lg">
                                <Award size={20} className="text-brand-500" />
                                Project Overview
                            </button>
                        </div>
                    </motion.div>

                </div>

                {/* Highly Decorative Abstract Background */}
                <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] bg-gradient-to-br from-indigo-200/40 to-purple-200/40 rounded-full mix-blend-multiply blur-3xl animate-blob"></div>
                    <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] bg-gradient-to-bl from-cyan-200/40 to-blue-200/40 rounded-full mix-blend-multiply blur-3xl animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-gradient-to-tr from-brand-200/30 to-emerald-200/30 rounded-full mix-blend-multiply blur-3xl animate-blob animation-delay-4000"></div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Core Technology</h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-brand-500 to-indigo-500 mx-auto rounded-full"></div>
                </div>
                <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
                    <FeatureCard
                        icon={Brain}
                        title="Adaptive Q-Learning"
                        desc="Continuously maps knowledge gaps and dynamically adjusts question difficulty using reinforcement learning."
                    />
                    <FeatureCard
                        icon={Zap}
                        title="Emotion Detection"
                        desc="Analyzes interaction telemetry (time taken, clicks) to infer frustration or boredom, keeping students in flow."
                    />
                    <FeatureCard
                        icon={BarChart2}
                        title="Mastery Tracking"
                        desc="Provides deep, granular insights into concept-level mastery and learning velocity across multiple subjects."
                    />
                </div>
            </section>
        </div>
    );
}
