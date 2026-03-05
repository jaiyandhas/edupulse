import React, { useEffect, useState } from 'react';
import { useCTVAuth } from '../../context/CTVAuthContext';
import { useNavigate } from 'react-router-dom';
import { ctvSupabase } from '../../lib/ctvSupabase';
import { parseQuestions } from '../../lib/questionParser';

const SAMPLE = `Question: What is register renaming used for?
Option A: Compile time optimization
Option B: Address translation
Option C: Removing false dependencies
Option D: Function parameter access
Answer: C
Explanation: Register renaming eliminates WAR and WAW hazards by mapping logical registers to physical registers, enabling out-of-order execution.
Subject: Computer Organization
GATE Year:
Source: GATE-inspired
Difficulty: Medium
------------------
Question: Which gate is called the universal gate?
Option A: AND gate
Option B: OR gate
Option C: NAND gate
Option D: XOR gate
Answer: C
Explanation: NAND is a universal gate because any Boolean function can be implemented using only NAND gates.
Subject: Digital Logic
GATE Year: 2019
Source: GATE PYQ
Difficulty: Easy
------------------`;

export default function CTVAdmin() {
    const { profile, loading } = useCTVAuth();
    const navigate = useNavigate();
    const [text, setText] = useState('');
    const [parsed, setParsed] = useState([]);
    const [parseError, setParseError] = useState('');
    const [inserting, setInserting] = useState(false);
    const [insertMsg, setInsertMsg] = useState('');
    const [counts, setCounts] = useState([]);

    useEffect(() => {
        if (!loading && profile?.role !== 'admin') {
            navigate('/ctv/dashboard');
        }
    }, [profile, loading, navigate]);

    useEffect(() => {
        const loadCounts = async () => {
            const { data } = await ctvSupabase.from('questions').select('subject');
            if (data) {
                const map = {};
                data.forEach(r => { map[r.subject] = (map[r.subject] || 0) + 1; });
                setCounts(Object.entries(map).map(([subject, count]) => ({ subject, count })).sort((a, b) => b.count - a.count));
            }
        };
        loadCounts();
    }, [insertMsg]);

    const handleParse = () => {
        setParseError('');
        setInsertMsg('');
        const result = parseQuestions(text);
        if (result.length === 0) {
            setParseError('No valid questions found. Check the format and make sure blocks are separated by "---"');
        }
        setParsed(result);
    };

    const handleInsert = async () => {
        if (parsed.length === 0) return;
        setInserting(true);
        const { error } = await ctvSupabase.from('questions').insert(parsed);
        if (error) {
            setParseError(error.message);
        } else {
            setInsertMsg(`✅ Successfully inserted ${parsed.length} question${parsed.length > 1 ? 's' : ''}!`);
            setText('');
            setParsed([]);
        }
        setInserting(false);
    };

    if (loading) return <div className="loading-overlay"><div className="spinner" /></div>;
    if (profile?.role !== 'admin') return null;

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">⚡ Admin Panel</h1>
                <p className="page-subtitle">Add questions by pasting in the structured format</p>
            </div>

            <div className="page-body">
                <div className="grid-2" style={{ gap: 24, alignItems: 'start' }}>
                    {/* Left: Add questions */}
                    <div>
                        <div className="card">
                            <h3 style={{ marginBottom: 16 }}>Add Questions</h3>

                            {parseError && <div className="alert alert-error">{parseError}</div>}
                            {insertMsg && <div className="alert alert-success">{insertMsg}</div>}

                            <div className="form-group">
                                <label className="form-label">Paste questions in structured format</label>
                                <textarea
                                    className="form-textarea"
                                    style={{ minHeight: 280, fontSize: 13, fontFamily: 'monospace' }}
                                    value={text}
                                    onChange={e => { setText(e.target.value); setParsed([]); setInsertMsg(''); }}
                                    placeholder={SAMPLE}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: 10 }}>
                                <button className="btn btn-secondary" onClick={handleParse} disabled={!text.trim()}>
                                    🔍 Parse & Preview
                                </button>
                                {parsed.length > 0 && (
                                    <button className="btn btn-primary" onClick={handleInsert} disabled={inserting}>
                                        {inserting ? <><span className="spinner" /> Inserting...</> : `✅ Insert ${parsed.length} Question${parsed.length > 1 ? 's' : ''}`}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Format guide */}
                        <div className="card" style={{ marginTop: 16 }}>
                            <h3 style={{ marginBottom: 12, fontSize: 14 }}>📋 Format Guide</h3>
                            <pre style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'monospace', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                {`Question: [question text]
Option A: [option]
Option B: [option]
Option C: [option]
Option D: [option]
Answer: A/B/C/D
Explanation: [explanation]
Subject: Computer Organization / Digital Logic / Data Structures
GATE Year: [year or leave blank]
Source: GATE PYQ / GATE-inspired / Practice Question
Difficulty: Easy / Medium / Hard
------------------
[next question...]`}
                            </pre>
                        </div>
                    </div>

                    {/* Right: Preview + Stats */}
                    <div>
                        {/* Question bank stats */}
                        <div className="card" style={{ marginBottom: 16 }}>
                            <h3 style={{ marginBottom: 14 }}>📊 Question Bank</h3>
                            {counts.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No questions yet</p>
                            ) : (
                                <>
                                    <table className="data-table">
                                        <thead>
                                            <tr><th>Subject</th><th>Questions</th></tr>
                                        </thead>
                                        <tbody>
                                            {counts.map(c => (
                                                <tr key={c.subject}>
                                                    <td style={{ color: 'var(--text-primary)' }}>{c.subject}</td>
                                                    <td><span className="badge badge-accent">{c.count}</span></td>
                                                </tr>
                                            ))}
                                            <tr>
                                                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Total</td>
                                                <td><span className="badge badge-success">{counts.reduce((s, c) => s + c.count, 0)}</span></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </>
                            )}
                        </div>

                        {/* Parse preview */}
                        {parsed.length > 0 && (
                            <div className="card fade-in">
                                <h3 style={{ marginBottom: 14 }}>Preview ({parsed.length} question{parsed.length > 1 ? 's' : ''} parsed)</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 400, overflowY: 'auto' }}>
                                    {parsed.map((q, i) => (
                                        <div key={i} style={{ padding: 12, background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                                            <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                                                <span className="badge badge-accent" style={{ fontSize: 11 }}>{q.subject}</span>
                                                <span className={`badge ${q.difficulty === 'Easy' ? 'badge-success' : q.difficulty === 'Hard' ? 'badge-error' : 'badge-warning'}`} style={{ fontSize: 11 }}>{q.difficulty}</span>
                                                <span className="badge badge-muted" style={{ fontSize: 11 }}>Ans: {q.correct_answer}</span>
                                            </div>
                                            <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                                                {q.question_text.slice(0, 100)}{q.question_text.length > 100 ? '…' : ''}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
