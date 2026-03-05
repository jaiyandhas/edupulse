import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCTVAuth } from '../../context/CTVAuthContext';
import { ctvSupabase } from '../../lib/ctvSupabase';

const SUBJECTS = ['All Subjects', 'Computer Organization', 'Digital Logic', 'Data Structures', 'Operating Systems'];
const DIFFICULTIES = ['All Levels', 'Easy', 'Medium', 'Hard'];

function parseCorrectAnswers(raw) {
    if (!raw) return [];
    return String(raw).split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
}

function answersMatch(selected, correct) {
    const a = [...selected].sort().join(',');
    const b = [...correct].sort().join(',');
    return a === b;
}

function PracticeContent() {
    const { user, profile, refreshProfile } = useCTVAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const urlSubject = searchParams.get('subject') ?? '';
    const urlMode = searchParams.get('mode') ?? '';

    const [questions, setQuestions] = useState([]);
    const [current, setCurrent] = useState(0);
    const [selected, setSelected] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(true);

    const [subject, setSubject] = useState(SUBJECTS.includes(urlSubject) ? urlSubject : 'All Subjects');
    const [difficulty, setDifficulty] = useState('All Levels');
    const [mode, setMode] = useState(urlMode === 'wrong_only' ? 'wrong_only' : 'normal');

    const [bookmarked, setBookmarked] = useState(false);
    const [streakCount, setStreakCount] = useState(profile?.streak || 0);
    const [answeredCount, setAnsweredCount] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [shuffledOptions, setShuffledOptions] = useState([]);

    useEffect(() => {
        if (profile) setStreakCount(profile.streak || 0);
    }, [profile]);

    const loadQuestions = useCallback(async (forceFresh = false) => {
        if (!user) return;
        setLoading(true);

        const isForceFresh = forceFresh === true;
        const sessionKey = `practice_session_${user.id}`;

        if (!isForceFresh) {
            const saved = sessionStorage.getItem(sessionKey);
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    if (data.subject === subject && data.difficulty === difficulty && data.mode === mode) {
                        setQuestions(data.questions || []);
                        setCurrent(data.current || 0);
                        setSelected(Array.isArray(data.selected) ? data.selected : []);
                        setSubmitted(data.submitted || false);
                        if (typeof data.answeredCount === 'number') setAnsweredCount(data.answeredCount);
                        if (typeof data.correctCount === 'number') setCorrectCount(data.correctCount);
                        if (data.shuffledOptions) setShuffledOptions(data.shuffledOptions);
                        setLoading(false);
                        return;
                    }
                } catch (e) {
                    console.error('Failed to parse practice session state', e);
                }
            }
        }

        sessionStorage.removeItem(sessionKey);
        setCurrent(0);
        setSelected([]);
        setSubmitted(false);

        if (mode === 'wrong_only') {
            let wrongQuery = ctvSupabase
                .from('question_attempts')
                .select('question_id')
                .eq('student_id', user.id)
                .eq('is_correct', false);

            const { data: wrongAttempts } = await wrongQuery;
            if (!wrongAttempts || wrongAttempts.length === 0) {
                setQuestions([]);
                setLoading(false);
                return;
            }

            const wrongIds = Array.from(new Set(wrongAttempts.map((a) => a.question_id)));

            let qQuery = ctvSupabase
                .from('questions')
                .select('*')
                .in('id', wrongIds)
                .neq('option_a', 'N/A');

            if (subject !== 'All Subjects') qQuery = qQuery.eq('subject', subject);
            if (difficulty !== 'All Levels') qQuery = qQuery.eq('difficulty', difficulty);

            const { data } = await qQuery;
            if (data) {
                setQuestions([...data].sort(() => Math.random() - 0.5));
            }
        } else {
            let correctQuery = ctvSupabase
                .from('question_attempts')
                .select('question_id')
                .eq('student_id', user.id)
                .eq('is_correct', true);

            const { data: correctAttempts } = await correctQuery;
            const correctIds = correctAttempts ? Array.from(new Set(correctAttempts.map((a) => a.question_id))) : [];

            let query = ctvSupabase.from('questions').select('*').neq('option_a', 'N/A');
            if (correctIds.length > 0) {
                query = query.not('id', 'in', `(${correctIds.join(',')})`);
            }

            if (subject !== 'All Subjects') query = query.eq('subject', subject);
            if (difficulty !== 'All Levels') query = query.eq('difficulty', difficulty);

            const { data } = await query.limit(200);
            if (data) {
                setQuestions([...data].sort(() => Math.random() - 0.5));
            }
        }
        setLoading(false);
    }, [user, subject, difficulty, mode]);

    useEffect(() => { loadQuestions(); }, [loadQuestions]);

    useEffect(() => {
        if (!user || loading || questions.length === 0) return;
        const sessionKey = `practice_session_${user.id}`;
        const sessionData = {
            subject, difficulty, mode,
            questions, current, selected, submitted,
            answeredCount, correctCount, shuffledOptions
        };
        sessionStorage.setItem(sessionKey, JSON.stringify(sessionData));
    }, [user, loading, questions, current, selected, submitted, answeredCount, correctCount, shuffledOptions, subject, difficulty, mode]);

    const checkBookmark = useCallback(async (qId) => {
        if (!user) return;
        const { data } = await ctvSupabase
            .from('bookmarks')
            .select('id')
            .eq('student_id', user.id)
            .eq('question_id', qId)
            .single();
        setBookmarked(!!data);
    }, [user]);

    useEffect(() => {
        if (questions[current]) {
            checkBookmark(questions[current].id);

            const q = questions[current];
            setShuffledOptions(prev => {
                const hasMatch = prev.length === 4 &&
                    prev.find(p => p.letter === 'A')?.text === q.option_a &&
                    prev.find(p => p.letter === 'B')?.text === q.option_b;
                if (hasMatch) return prev;

                const options = [
                    { letter: 'A', text: q.option_a },
                    { letter: 'B', text: q.option_b },
                    { letter: 'C', text: q.option_c },
                    { letter: 'D', text: q.option_d }
                ];
                return options.sort(() => Math.random() - 0.5);
            });
        }
    }, [current, questions, checkBookmark]);

    const isMSQ = (q) => {
        if (!q) return false;
        return q.question_type === 'MSQ' || parseCorrectAnswers(q.correct_answer).length > 1;
    };

    const handleOptionClick = (letter) => {
        if (submitted) return;
        const q = questions[current];
        if (!q) return;

        if (isMSQ(q)) {
            setSelected(prev =>
                prev.includes(letter) ? prev.filter(l => l !== letter) : [...prev, letter]
            );
        } else {
            setSelected([letter]);
        }
    };

    const handleSubmit = async () => {
        if (selected.length === 0 || !user || !questions[current]) return;
        const q = questions[current];
        const correctAnswers = parseCorrectAnswers(q.correct_answer);
        const isCorrect = answersMatch(selected, correctAnswers);
        setSubmitted(true);
        setAnsweredCount(c => c + 1);
        if (isCorrect) setCorrectCount(c => c + 1);

        const selectedStr = [...selected].sort().join(',');

        await ctvSupabase.from('question_attempts').insert({
            student_id: user.id,
            question_id: q.id,
            selected_answer: selectedStr,
            is_correct: isCorrect,
        });

        if (isCorrect) {
            const newStreak = streakCount + 1;
            setStreakCount(newStreak);
            await ctvSupabase.from('student_profiles').update({ streak: newStreak }).eq('id', user.id);
            if (refreshProfile) await refreshProfile();
        } else {
            await ctvSupabase.from('student_profiles').update({ streak: 0 }).eq('id', user.id);
            setStreakCount(0);
            if (refreshProfile) await refreshProfile();
        }
    };

    const handleNext = () => {
        if (current < questions.length - 1) {
            setCurrent(c => c + 1);
            setSelected([]);
            setSubmitted(false);
        }
    };

    const handleBookmark = async () => {
        if (!user || !questions[current]) return;
        const qId = questions[current].id;
        if (bookmarked) {
            await ctvSupabase.from('bookmarks').delete().eq('student_id', user.id).eq('question_id', qId);
            setBookmarked(false);
        } else {
            await ctvSupabase.from('bookmarks').insert({ student_id: user.id, question_id: qId });
            setBookmarked(true);
        }
    };

    const q = questions[current];

    const getOptionClass = (letter) => {
        if (!q) return 'option-btn';
        const correctAnswers = parseCorrectAnswers(q.correct_answer);
        const isCorrectLetter = correctAnswers.includes(letter);
        const isSelectedLetter = selected.includes(letter);

        if (!submitted) {
            return isSelectedLetter ? 'option-btn selected' : 'option-btn';
        }
        if (isCorrectLetter) return 'option-btn correct';
        if (isSelectedLetter && !isCorrectLetter) return 'option-btn wrong';
        return 'option-btn';
    };

    const handleModeToggle = (newMode) => {
        setMode(newMode);
        const params = new URLSearchParams();
        if (subject !== 'All Subjects') params.set('subject', subject);
        if (newMode === 'wrong_only') params.set('mode', 'wrong_only');
        setSearchParams(params);
    };

    const formatCorrectAnswers = (raw) => {
        const letters = parseCorrectAnswers(raw);
        if (letters.length === 1) return `Option ${letters[0]}`;
        const last = letters[letters.length - 1];
        const rest = letters.slice(0, -1);
        return `Options ${rest.join(', ')} and ${last}`;
    };

    const isCorrectSubmission = q ? answersMatch(selected, parseCorrectAnswers(q.correct_answer)) : false;

    return (
        <div>
            <div className="page-header">
                <div className="page-header-inner">
                    <div>
                        <h1 className="page-title">Practice Mode</h1>
                        <p className="page-subtitle">
                            {mode === 'wrong_only' ? '🔁 Retrying wrong answers' : 'GATE-style MCQ/MSQ — one question at a time'}
                        </p>
                    </div>
                    {streakCount > 0 && (
                        <div className="streak-badge">🔥 {streakCount} streak</div>
                    )}
                </div>
            </div>

            <div className="page-body">
                {/* Filters */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                    <div className="tabs" style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: 4, display: 'flex', gap: 4 }}>
                        <button
                            className={`tab-btn${mode === 'normal' ? ' active' : ''}`}
                            onClick={() => handleModeToggle('normal')}
                        >
                            Normal
                        </button>
                        <button
                            className={`tab-btn${mode === 'wrong_only' ? ' active' : ''}`}
                            onClick={() => handleModeToggle('wrong_only')}
                            style={mode === 'wrong_only' ? { color: 'var(--error)' } : {}}
                        >
                            🔁 Retry Wrong
                        </button>
                    </div>

                    <select
                        className="form-select"
                        style={{ width: 200 }}
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                    >
                        {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                    </select>
                    <select
                        className="form-select"
                        style={{ width: 160 }}
                        value={difficulty}
                        onChange={e => setDifficulty(e.target.value)}
                    >
                        {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                    </select>
                    <button className="btn btn-secondary btn-sm" onClick={() => loadQuestions(true)}>
                        🔀 Shuffle
                    </button>
                    {answeredCount > 0 && (
                        <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                            Session: {correctCount}/{answeredCount} correct
                        </span>
                    )}
                </div>

                {loading ? (
                    <div className="loading-overlay"><div className="spinner" /></div>
                ) : questions.length === 0 ? (
                    <div className="empty-state">
                        {mode === 'wrong_only' ? (
                            <>
                                <span style={{ fontSize: 36 }}>🎉</span>
                                <h3>No wrong answers found!</h3>
                                <p>{subject !== 'All Subjects' ? `No incorrect answers for ${subject}` : "You've got a clean slate — great job!"}</p>
                                <button className="btn btn-primary btn-sm" onClick={() => handleModeToggle('normal')}>
                                    Practice normally →
                                </button>
                            </>
                        ) : (
                            <>
                                <h3>No questions found</h3>
                                <p>Try changing the subject or difficulty filter</p>
                            </>
                        )}
                    </div>
                ) : (
                    <>
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                                <span>Question {current + 1} of {questions.length}</span>
                                <span>{Math.round(((current + 1) / questions.length) * 100)}%</span>
                            </div>
                            <div className="progress-bar-track">
                                <div className="progress-bar-fill" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
                            </div>
                        </div>

                        <div className="card fade-in" key={q.id}>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
                                <span className="badge badge-accent">{q.subject}</span>
                                <span className={`badge ${q.difficulty === 'Easy' ? 'badge-success' : q.difficulty === 'Hard' ? 'badge-error' : 'badge-warning'}`}>
                                    {q.difficulty}
                                </span>
                                <span className="badge badge-muted">{q.source_type}</span>
                                {q.gate_year && <span className="badge badge-muted">GATE {q.gate_year}</span>}
                                {!q.gate_year && q.source_type?.toLowerCase().includes('gate') && (
                                    <span className="badge badge-muted">Year not specified</span>
                                )}
                                {isMSQ(q) && (
                                    <span className="badge" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}>
                                        ☑ MSQ — select all correct
                                    </span>
                                )}
                            </div>

                            <div className="question-number">Question {current + 1}</div>
                            <div className="question-text">{q.question_text}</div>

                            {isMSQ(q) && !submitted && (
                                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, marginTop: -8 }}>
                                    💡 This is an MSQ — you may select multiple answers before submitting.
                                </p>
                            )}

                            <div className="options-grid">
                                {shuffledOptions.map((opt) => (
                                    <button
                                        key={opt.letter}
                                        className={getOptionClass(opt.letter)}
                                        onClick={() => handleOptionClick(opt.letter)}
                                        disabled={submitted}
                                    >
                                        <span className="option-letter">{opt.letter}</span>
                                        <span>{opt.text}</span>
                                    </button>
                                ))}
                            </div>

                            {!submitted && (
                                <div className="action-bar">
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleSubmit}
                                        disabled={selected.length === 0}
                                    >
                                        Submit Answer{isMSQ(q) && selected.length > 1 ? ` (${selected.length} selected)` : ''}
                                    </button>
                                    <button className="btn btn-ghost btn-sm" onClick={handleNext}>
                                        Skip Question
                                    </button>
                                    <button className="btn btn-ghost btn-sm" onClick={handleBookmark}>
                                        {bookmarked ? '🔖 Bookmarked' : '+ Retry Later'}
                                    </button>
                                </div>
                            )}

                            {submitted && (
                                <div className="fade-in">
                                    <div className={`alert ${isCorrectSubmission ? 'alert-success' : 'alert-error'}`}>
                                        {isCorrectSubmission ? (
                                            <>✅ Correct! The answer is <strong>{formatCorrectAnswers(q.correct_answer)}</strong></>
                                        ) : (
                                            <>❌ Incorrect. The correct answer is <strong>{formatCorrectAnswers(q.correct_answer)}</strong></>
                                        )}
                                    </div>

                                    <div className="explanation-box">
                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6, fontSize: 13 }}>
                                            💡 Explanation
                                        </div>
                                        {q.explanation}
                                    </div>

                                    <div className="action-bar">
                                        <button
                                            className="btn btn-primary"
                                            onClick={handleNext}
                                            disabled={current >= questions.length - 1}
                                        >
                                            Next Question →
                                        </button>
                                        <button
                                            className={`btn ${bookmarked ? 'btn-success' : 'btn-secondary'} btn-sm`}
                                            onClick={handleBookmark}
                                        >
                                            {bookmarked ? '🔖 Bookmarked' : '🔖 Retry Later'}
                                        </button>
                                        {current >= questions.length - 1 && (
                                            <button className="btn btn-ghost btn-sm" onClick={() => loadQuestions(true)}>
                                                Restart 🔄
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function CTVPractice() {
    return (
        <Suspense fallback={
            <div className="loading-overlay" style={{ minHeight: '100vh' }}>
                <div className="spinner" />
            </div>
        }>
            <PracticeContent />
        </Suspense>
    );
}
