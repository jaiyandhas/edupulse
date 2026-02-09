import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Brain, Zap, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';

const FeatureCard = ({ icon: Icon, title, desc }) => (
    <div className="bg-white p-6 rounded-xl border border-brand-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="w-12 h-12 bg-brand-50 rounded-lg flex items-center justify-center text-brand-600 mb-4">
            <Icon size={24} />
        </div>
        <h3 className="text-lg font-semibold text-brand-900 mb-2">{title}</h3>
        <p className="text-brand-500 text-sm leading-relaxed">{desc}</p>
    </div>
);

export default function Landing() {
    return (
        <div className="space-y-24 pb-24">
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-brand-900 mb-6 max-w-4xl mx-auto">
                            Adaptive Intelligence for <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-accent-DEFAULT">
                                Smarter Learning Paths
                            </span>
                        </h1>
                        <p className="text-xl text-brand-500 max-w-2xl mx-auto mb-10 leading-relaxed">
                            EduPulse creates a personalized curriculum in real-time using reinforcement learning
                            and behavioral state inference.
                        </p>

                        <div className="flex justify-center gap-4">
                            <Link to="/domains" className="btn-primary flex items-center gap-2 px-8 py-4 text-base">
                                Explore Domains <ArrowRight size={18} />
                            </Link>
                            <button className="btn-secondary px-8 py-4 text-base">
                                View Methodology
                            </button>
                        </div>
                    </motion.div>

                </div>

                {/* Abstract Background Decoration */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
                    <div className="absolute top-20 left-10 w-64 h-64 bg-brand-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                    <div className="absolute top-20 right-10 w-64 h-64 bg-accent-light rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={Brain}
                        title="Deep Tracing"
                        desc="Our Q-Learning engine maps your knowledge gaps 10x faster than traditional linear quizzes."
                    />
                    <FeatureCard
                        icon={Zap}
                        title="Emotion-Aware"
                        desc="Detects frustration or boredom via behavioral heuristics and adjusts difficulty instantly to maintain flow."
                    />
                    <FeatureCard
                        icon={BarChart2}
                        title="Predictive Analytics"
                        desc="Visualize your learning velocity and mastery retention with research-grade data dashboards."
                    />
                </div>
            </section>
        </div>
    );
}
