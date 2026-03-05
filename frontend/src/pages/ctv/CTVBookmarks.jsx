import React, { useEffect, useState, useCallback } from 'react';
import { useCTVAuth } from '../../context/CTVAuthContext';
import { ctvSupabase } from '../../lib/ctvSupabase';
import { Link } from 'react-router-dom';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export default function CTVBookmarks() {
    const { user } = useCTVAuth();
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [current, setCurrent] = useState(0);
    const [selected, setSelected] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [mode, setMode] = useState('list'); // 'list' | 'practice'

    const loadBookmarks = useCallback(async () => {
        if (!user) return;
        const { data } = await ctvSupabase
            .from('bookmarks')
            .select('*, questions(*)')
            .eq('student_id', user.id)
            .order('created_at', { ascending: false });
        // Handle unexpected nulls
        setBookmarks((data || []));
        setLoading(false);
    }, [user]);

    useEffect(() => { loadBookmarks(); }, [loadBookmarks]);

    const removeBookmark = async (id) => {
        await ctvSupabase.from('bookmarks').delete().eq('id', id);
        setBookmarks(prev => prev.filter(b => b.id !== id));
    };

    const startPractice = (index) => {
        setCurrent(index);
        setSelected(null);
        setSubmitted(false);
        setMode('practice');
    };

    const q = mode === 'practice' ? bookmarks[current]?.questions : null;

    const handleSubmit = async () => {
        if (!selected || !user || !q) return;
        const isCorrect = selected === q.correct_answer;
        setSubmitted(true);
        await ctvSupabase.from('question_attempts').insert({
            student_id: user.id,
            question_id: q.id,
            selected_answer: selected,
            is_correct: isCorrect,
        });
    };

    const getOptionClass = (letter) => {
        if (!submitted) return selected === letter ? 'option-btn selected' : 'option-btn';
        if (letter === q?.correct_answer) return 'option-btn correct';
        if (letter === selected && letter !== q?.correct_answer) return 'option-btn wrong';
        return 'option-btn';
    };

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <h1 className="page-title">🔖 Retry Later</h1>
                        <p className="page-subtitle">{bookmarks.length} bookmarked question{bookmarks.length !== 1 ? 's' : ''}</p>
                    </div>
                    {mode === 'practice' && (
                        <button className="btn btn-secondary btn-sm" onClick={() => setMode('list')}>← Back to list</button>
                    )}
                </div>
            </div>

            <div className="page-body">
                {loading ? (
                    <div className="loading-overlay"><div className="spinner" /></div>
                ) : bookmarks.length === 0 ? (
                    <div className="empty-state">
                        <div style={{ fontSize: 48 }}>🔖</div>
                        <h3>No bookmarks yet</h3>
                        <p>When practicing, click "Retry Later" to save questions here</p>
                        <Link to="/ctv/practice" className="btn btn-primary" style={{ marginTop: 8 }}>Go Practice</Link>
                    </div>
                ) : mode === 'list' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {bookmarks.map((b, i) => (
                            <div key={b.id} className="card card-sm" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                                        <span className="badge badge-accent">{b.questions.subject}</span>
                                        <span className={`badge ${b.questions.difficulty === 'Easy' ? 'badge-success' : b.questions.difficulty === 'Hard' ? 'badge-error' : 'badge-warning'}`}>
                                            {b.questions.difficulty}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                                        {b.questions.question_text.length > 150
                                            ? b.questions.question_text.slice(0, 150) + '...'
                                            : b.questions.question_text}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                                    <button className="btn btn-primary btn-sm" onClick={() => startPractice(i)}>
                                        Practice
                                    </button>
                                    <button className="btn btn-ghost btn-sm" onClick={() => removeBookmark(b.id)}>
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : q && (
                    <div className="card fade-in">
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                            <span className="badge badge-accent">{q.subject}</span>
                            <span className={`badge ${q.difficulty === 'Easy' ? 'badge-success' : q.difficulty === 'Hard' ? 'badge-error' : 'badge-warning'}`}>
                                {q.difficulty}
                            </span>
                            <span className="badge badge-muted">{q.source_type}</span>
                        </div>
                        <div className="question-number">Bookmarked Question {current + 1} of {bookmarks.length}</div>
                        <div className="question-text">{q.question_text}</div>
                        <div className="options-grid">
                            {OPTION_LABELS.map((letter, i) => (
                                <button
                                    key={letter}
                                    className={getOptionClass(letter)}
                                    onClick={() => !submitted && setSelected(letter)}
                                    disabled={submitted}
                                >
                                    <span className="option-letter">{letter}</span>
                                    <span>{[q.option_a, q.option_b, q.option_c, q.option_d][i]}</span>
                                </button>
                            ))}
                        </div>
                        {!submitted && (
                            <div className="action-bar">
                                <button className="btn btn-primary" onClick={handleSubmit} disabled={!selected}>Submit Answer</button>
                            </div>
                        )}
                        {submitted && (
                            <div className="fade-in">
                                <div className={`alert ${selected === q.correct_answer ? 'alert-success' : 'alert-error'}`}>
                                    {selected === q.correct_answer ? <>✅ Correct! Answer: <strong>Option {q.correct_answer}</strong></> : <>❌ Incorrect. Correct: <strong>Option {q.correct_answer}</strong></>}
                                </div>
                                <div className="explanation-box">
                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6, fontSize: 13 }}>💡 Explanation</div>
                                    {q.explanation}
                                </div>
                                <div className="action-bar">
                                    {current < bookmarks.length - 1 ? (
                                        <button className="btn btn-primary" onClick={() => { setCurrent(c => c + 1); setSelected(null); setSubmitted(false); }}>
                                            Next Bookmark →
                                        </button>
                                    ) : (
                                        <button className="btn btn-secondary" onClick={() => setMode('list')}>← Back to list</button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
