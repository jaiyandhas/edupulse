import React from 'react';
import { Link } from 'react-router-dom';
import { Code, BookOpen, PenTool, Database, Cpu, Globe, ArrowRight, Zap, Brain, Calculator } from 'lucide-react';

const DomainCard = ({ title, icon: Icon, active = false, path = "#" }) => (
    <Link
        to={active ? path : "#"}
        className={`
      group block p-8 rounded-2xl transition-all duration-300 relative overflow-hidden
      ${active
                ? 'glass-card cursor-pointer'
                : 'bg-white/40 border border-white/30 opacity-70 cursor-not-allowed hover:bg-white/50'
            }
    `}
    >
        {active && <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-brand-100 to-transparent opacity-50 rounded-bl-full -mr-8 -mt-8"></div>}

        <div className={`
      w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-colors shadow-sm
      ${active ? 'bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white' : 'bg-slate-100 text-slate-400'}
    `}>
            <Icon size={28} />
        </div>

        <h3 className={`text-lg font-bold mb-2 ${active ? 'text-brand-900 group-hover:text-brand-700' : 'text-slate-500'}`}>{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed">
            {active ? 'Top-tier adaptive curriculum available.' : 'Module under continuous expansion.'}
        </p>

        {active && (
            <div className="mt-6 flex items-center md:opacity-0 md:-translate-x-4 md:group-hover:opacity-100 md:group-hover:translate-x-0 transition-all duration-300">
                <span className="text-xs font-bold text-accent-DEFAULT uppercase tracking-wider mr-2">Enter Domain</span>
                <ArrowRight size={14} className="text-accent-DEFAULT" />
            </div>
        )}
    </Link>
);

export default function Domains() {
    const domains = [
        { title: "Computer Science", icon: Code, active: true, path: "/domains/engineering/cs" },
        { title: "School Mathematics", icon: Calculator, active: true, path: "/learn/school_math/adaptive" },
        { title: "Data Science", icon: Database, active: true, path: "/learn/data_science/adaptive" },
        { title: "Electrical Eng.", icon: Zap, active: true, path: "/learn/electrical_engineering/adaptive" },
        { title: "Mechanical Eng.", icon: PenTool, active: true, path: "/learn/mechanical_engineering/adaptive" },
        { title: "Psychology", icon: Brain, active: true, path: "/learn/psychology/adaptive" },
        { title: "Cloud & DevOps", icon: Globe, active: false },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="mb-12">
                <h2 className="text-3xl font-bold text-brand-900 mb-4">Select Learning Domain</h2>
                <p className="text-brand-500 max-w-2xl">
                    Choose a field to begin your adaptive learning journey.
                    Currently, our Engineering & Technical division has the most active modules.
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {domains.map((d) => (
                    <DomainCard key={d.title} {...d} />
                ))}
            </div>
        </div>
    );
}
