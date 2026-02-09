import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, BookOpen, ChevronRight, Layers, Target, Code, Database, Server, Smartphone, Globe } from 'lucide-react';
import { useParams } from 'react-router-dom';

const UnitCard = ({ unit, title, progress, total, path, active }) => (
    <Link to={path} className={`group block relative pl-8 pb-8 border-l-2 ${active ? 'border-indigo-500' : 'border-slate-200'} last:border-0`}>
        <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 ${active ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'} transition-all group-hover:scale-110`}></div>

        <div className={`
             p-6 rounded-2xl border transition-all duration-300
             ${active ? 'bg-white border-indigo-100 shadow-lg group-hover:shadow-xl group-hover:-translate-y-1' : 'bg-slate-50 border-slate-100 opacity-70'}
        `}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1 block">Unit {unit}</span>
                    <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                </div>
                {active && <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><BookOpen size={20} /></div>}
            </div>

            {active && (
                <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-2 font-medium">
                        <span>{progress}% Mastery</span>
                        <span>{Math.round((progress / 100) * total)} / {total} Concepts</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            )}

            <div className="mt-4 flex items-center text-sm font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                Start Lesson <ChevronRight size={16} />
            </div>
        </div>
    </Link>
);

export default function TopicSelection() {
    const params = useParams();
    const domainId = params.domainId || 'dsa';

    // Mock Progress Data (In real app, fetch from backend)
    const units = [
        { id: 1, title: "Arrays & Strings", progress: 65, total: 12, path: `/learn/${domainId}/adaptive?mode=lesson&concept=arrays`, active: true },
        { id: 2, title: "Linked Lists", progress: 30, total: 8, path: `/learn/${domainId}/adaptive?mode=lesson&concept=linked_lists`, active: true },
        { id: 3, title: "Stacks & Queues", progress: 0, total: 10, path: "#", active: true },
        { id: 4, title: "Sorting Algorithms", progress: 0, total: 15, path: `/learn/${domainId}/adaptive?mode=lesson&concept=sorting`, active: true },
        { id: 5, title: "Trees & Graphs", progress: 0, total: 20, path: "#", active: false },
    ];

    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <Link to="/domains" className="inline-flex items-center text-slate-400 hover:text-indigo-600 mb-8 transition-colors">
                <ChevronLeft size={20} /> Back to Domains
            </Link>

            <div className="flex justify-between items-end mb-12">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Computer Science Curriculum</h1>
                    <p className="text-slate-500">Master the fundamentals of DSA through structured lessons.</p>
                </div>
                <Link
                    to={`/learn/${domainId}/adaptive?mode=diagnostic`}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                >
                    <Target size={18} /> Placement Test
                </Link>
            </div>

            <div className="pl-4">
                {units.map(u => <UnitCard key={u.id} unit={u.id} {...u} />)}
            </div>
        </div>
    );
}
