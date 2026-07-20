import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { journalService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Trash2, BookOpen, CheckCircle, AlertTriangle, ArrowRight,
    ChevronRight, Clock, Feather, Shield, FileText, X, Search, Edit2
} from 'lucide-react';
import Navbar from '../components/Navbar';

// ── Mood Configuration ──────────────────────────────────────────────────────
const MOOD_CONFIG = {
    happy:    { emoji: '😊', label: 'Happy',    accent: 'emerald',  bar: 'bg-emerald-400' },
    sad:      { emoji: '😢', label: 'Sad',      accent: 'blue',     bar: 'bg-blue-400'    },
    anxious:  { emoji: '😰', label: 'Anxious',  accent: 'amber',    bar: 'bg-amber-400'   },
    stressed: { emoji: '😤', label: 'Stressed', accent: 'orange',   bar: 'bg-orange-400'  },
    calm:     { emoji: '😌', label: 'Calm',     accent: 'teal',     bar: 'bg-teal-400'    },
    angry:    { emoji: '😠', label: 'Angry',    accent: 'red',      bar: 'bg-red-400'     },
    hopeful:  { emoji: '🌟', label: 'Hopeful',  accent: 'yellow',   bar: 'bg-yellow-400'  },
    lonely:   { emoji: '🚶', label: 'Lonely',   accent: 'indigo',   bar: 'bg-indigo-400'  },
    helpless: { emoji: '🥀', label: 'Helpless', accent: 'rose',     bar: 'bg-rose-400'    },
    confused: { emoji: '🤔', label: 'Confused', accent: 'purple',   bar: 'bg-purple-400'  },
    neutral:  { emoji: '😐', label: 'Neutral',  accent: 'gray',     bar: 'bg-gray-400'    },
};

const SEVERITY_CONFIG = {
    RED:    { label: 'High distress',  pill: 'bg-red-100 text-red-700 border-red-200',    dot: 'bg-red-500'    },
    YELLOW: { label: 'Mild distress',  pill: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-400' },
    GREEN:  { label: 'Low distress',   pill: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
};

// ── Tiny Sub-components ──────────────────────────────────────────────────────
const MoodPill = ({ mood }) => {
    const cfg = MOOD_CONFIG[mood] || MOOD_CONFIG.neutral;
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-${cfg.accent}-50 text-${cfg.accent}-700 border border-${cfg.accent}-200`}>
            {cfg.emoji} {cfg.label}
        </span>
    );
};

const SeverityDot = ({ severity }) => {
    const cfg = SEVERITY_CONFIG[severity];
    if (!cfg) return null;
    return <span className={`inline-block w-2 h-2 rounded-full ${cfg.dot} shrink-0`} title={cfg.label} />;
};

const WordCounter = ({ text }) => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    return (
        <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
            <span>{words} {words === 1 ? 'word' : 'words'}</span>
            <span className="w-px h-3 bg-gray-200" />
            <span>{chars} chars</span>
        </div>
    );
};

// ── Main Component ──────────────────────────────────────────────────────────
const JournalPage = () => {
    const [entries, setEntries]           = useState([]);
    const [showNewEntry, setShowNewEntry] = useState(false);
    const [isEditing, setIsEditing]       = useState(false);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [title, setTitle]               = useState('');
    const [newEntry, setNewEntry]         = useState('');
    const [loading, setLoading]           = useState(true);
    const [saving, setSaving]             = useState(false);
    const [successMsg, setSuccessMsg]     = useState('');
    const [criticalAlert, setCriticalAlert] = useState(false);
    const [searchQuery, setSearchQuery]   = useState('');

    const textareaRef = useRef(null);

    useEffect(() => { fetchEntries(); }, []);

    // Auto-focus on textarea when writing panel opens
    useEffect(() => {
        if (showNewEntry && textareaRef.current) {
            setTimeout(() => textareaRef.current?.focus(), 100);
        }
    }, [showNewEntry]);

    const fetchEntries = async () => {
        try {
            const res = await journalService.getEntries();
            setEntries(res.entries || []);
        } catch (err) {
            console.error('Error fetching entries:', err);
        } finally {
            setLoading(false);
        }
    };

    const showFlash = (msg) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 4000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newEntry.trim()) return;
        setSaving(true);
        try {
            if (isEditing && selectedEntry) {
                const res = await journalService.updateEntry(selectedEntry.id, newEntry.trim(), title.trim());
                showFlash(`Entry updated successfully`);
                setIsEditing(false);
                setSelectedEntry(res.entry);
            } else {
                const res = await journalService.createEntry(newEntry.trim(), title.trim());
                const detectedMood = res.detected_mood || 'neutral';
                const severity     = res.severity || 'GREEN';

                if (severity === 'RED') {
                    setCriticalAlert(true);
                } else {
                    const moodCfg = MOOD_CONFIG[detectedMood] || MOOD_CONFIG.neutral;
                    const sevIcon = severity === 'YELLOW' ? '🟡' : '🟢';
                    showFlash(`Entry saved · Detected mood: ${moodCfg.emoji} ${moodCfg.label} ${sevIcon}`);
                }
            }

            setTitle(''); setNewEntry(''); setShowNewEntry(false);
            fetchEntries();
        } catch (err) {
            console.error('Error saving entry:', err);
            alert('Failed to save entry. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Permanently delete this journal entry?')) return;
        try {
            await journalService.deleteEntry(id);
            if (selectedEntry?.id === id) setSelectedEntry(null);
            fetchEntries();
        } catch (err) {
            console.error('Error deleting entry:', err);
        }
    };

    const formatDate = (iso) => new Date(iso).toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });

    const formatTime = (iso) => new Date(iso).toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: true
    });

    const filteredEntries = entries.filter(e =>
        !searchQuery ||
        e.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.content?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col">
            <Navbar />

            {/* ── Critical Distress Alert ─────────────────────────────── */}
            <AnimatePresence>
                {criticalAlert && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-x-0 top-16 z-50 px-4 pt-2"
                    >
                        <div className="max-w-3xl mx-auto p-6 bg-red-50 border-2 border-red-400 rounded-3xl shadow-2xl shadow-red-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-72 h-72 bg-red-300 opacity-15 blur-3xl rounded-full pointer-events-none" />
                            <div className="relative flex items-start gap-5">
                                <div className="p-3 bg-red-100 rounded-2xl text-red-600 animate-pulse">
                                    <AlertTriangle className="w-7 h-7" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-red-900 mb-1">We hear you. You are not alone.</h3>
                                    <p className="text-red-700 text-sm mb-5 leading-relaxed">
                                        Your entry contains words that suggest you may be going through a very difficult time.
                                        Reaching out for professional support is a sign of strength.
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        <a
                                            href="tel:14416"
                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm shadow-md transition-all"
                                        >
                                            📞 Talk to a Professional (14416)
                                        </a>
                                        <Link
                                            to="/relax"
                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-red-700 border border-red-200 rounded-xl font-semibold text-sm hover:bg-red-50 transition-all"
                                        >
                                            Decompress & Relax <ArrowRight className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => setCriticalAlert(false)}
                                            className="ml-auto p-2 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Flash Toast ─────────────────────────────────────────── */}
            <AnimatePresence>
                {successMsg && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 bg-gray-900 text-white rounded-2xl shadow-xl text-sm font-medium"
                    >
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        {successMsg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Main Layout ─────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 py-8 gap-6">

                {/* Page Title */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Private Journal</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {entries.length} {entries.length === 1 ? 'entry' : 'entries'} · AI mood detection enabled
                        </p>
                    </div>
                    <button
                        onClick={() => { setShowNewEntry(true); setSelectedEntry(null); }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-violet-200 transition-all hover:-translate-y-0.5"
                    >
                        <Plus className="w-4 h-4" />
                        New Entry
                    </button>
                </div>

                {/* ── Writing Panel ─────────────────────────────────── */}
                <AnimatePresence>
                    {showNewEntry && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                                {/* Writing toolbar */}
                                <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                                    <Feather className="w-4 h-4 text-violet-500" />
                                    <span className="text-sm font-semibold text-gray-700">New Journal Entry</span>
                                    <span className="text-xs text-gray-400 ml-1">· AI mood analysis on save</span>
                                    <div className="ml-auto flex items-center gap-2">
                                        <WordCounter text={newEntry} />
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6">
                                    {/* Title */}
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        placeholder="Entry title (optional)..."
                                        className="w-full text-xl font-bold text-gray-900 placeholder-gray-300 border-none outline-none bg-transparent mb-4"
                                    />

                                    {/* Separator */}
                                    <div className="w-16 h-px bg-violet-200 mb-5" />

                                    {/* Body */}
                                    <textarea
                                        ref={textareaRef}
                                        value={newEntry}
                                        onChange={e => setNewEntry(e.target.value)}
                                        placeholder="Begin writing your thoughts... The AI will automatically detect your emotional state when you save."
                                        rows={10}
                                        required
                                        className="w-full text-gray-700 leading-relaxed placeholder-gray-300 text-sm border-none outline-none resize-none bg-transparent"
                                    />

                                    {/* Footer actions */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <Shield className="w-3.5 h-3.5" />
                                            <span>End-to-end encrypted · private to you only</span>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => { setShowNewEntry(false); setTitle(''); setNewEntry(''); setIsEditing(false); }}
                                                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={saving || !newEntry.trim()}
                                                className="flex items-center gap-2 px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                                            >
                                                {saving ? (
                                                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {isEditing ? 'Updating...' : 'Analyzing...'}</>
                                                ) : (
                                                    <><BookOpen className="w-4 h-4" /> {isEditing ? 'Update Entry' : 'Save Entry'}</>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Split-pane: Entry List + Reader ─────────────────── */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6">

                    {/* Left sidebar: entry list */}
                    <div className="lg:col-span-2 flex flex-col gap-4">
                        {/* Search bar */}
                        {entries.length > 2 && (
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search entries..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400 outline-none transition-all"
                                />
                            </div>
                        )}

                        {/* Entries */}
                        <div className="space-y-2">
                            {loading ? (
                                <div className="text-center py-20 text-gray-400 text-sm">Loading your entries...</div>
                            ) : filteredEntries.length === 0 && !searchQuery ? (
                                <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
                                    <div className="text-5xl mb-4">📖</div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">Your journal is empty</h3>
                                    <p className="text-sm text-gray-500 mb-5">Start capturing your thoughts. All entries remain completely private.</p>
                                    <button
                                        onClick={() => setShowNewEntry(true)}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-bold rounded-xl"
                                    >
                                        <Plus className="w-4 h-4" /> Write First Entry
                                    </button>
                                </div>
                            ) : filteredEntries.length === 0 ? (
                                <div className="text-center py-10 text-sm text-gray-400">No entries match your search</div>
                            ) : (
                                filteredEntries.map((entry) => {
                                    const moodCfg = MOOD_CONFIG[entry.mood_tag] || MOOD_CONFIG.neutral;
                                    const sevCfg  = SEVERITY_CONFIG[entry.severity];
                                    const isSelected = selectedEntry?.id === entry.id;
                                    return (
                                        <motion.button
                                            key={entry.id}
                                            onClick={() => { setSelectedEntry(entry); setShowNewEntry(false); }}
                                            whileHover={{ y: -1 }}
                                            className={`w-full text-left p-4 rounded-xl border transition-all ${
                                                isSelected
                                                    ? 'bg-white border-violet-300 ring-2 ring-violet-100 shadow-sm'
                                                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                            }`}
                                        >
                                            {/* Mood color accent bar */}
                                            <div className={`h-1 w-12 rounded-full ${moodCfg.bar} mb-3`} />

                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">
                                                    {entry.title || 'Untitled Entry'}
                                                </h4>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    {sevCfg && <SeverityDot severity={entry.severity} />}
                                                    <span className="text-xs">{moodCfg.emoji}</span>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
                                                {entry.content}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <time className="text-xs text-gray-400 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDate(entry.created_at)}
                                                </time>
                                                <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                                            </div>
                                        </motion.button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Right panel: entry reader */}
                    <div className="lg:col-span-3">
                        <AnimatePresence mode="wait">
                            {selectedEntry ? (
                                <motion.div
                                    key={selectedEntry.id}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.25 }}
                                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden h-full shadow-sm"
                                >
                                    {/* Reader header */}
                                    <div className="flex items-start justify-between px-7 pt-7 pb-5 border-b border-gray-100">
                                        <div className="flex-1">
                                            <h2 className="text-xl font-bold text-gray-900 mb-1">
                                                {selectedEntry.title || 'Untitled Entry'}
                                            </h2>
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <time className="text-xs text-gray-400 flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {formatDate(selectedEntry.created_at)} · {formatTime(selectedEntry.created_at)}
                                                </time>
                                                {selectedEntry.mood_tag && (
                                                    <MoodPill mood={selectedEntry.mood_tag} />
                                                )}
                                                {selectedEntry.severity && SEVERITY_CONFIG[selectedEntry.severity] && (
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${SEVERITY_CONFIG[selectedEntry.severity].pill}`}>
                                                        <SeverityDot severity={selectedEntry.severity} />
                                                        {SEVERITY_CONFIG[selectedEntry.severity].label}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <button
                                                onClick={() => {
                                                    setIsEditing(true);
                                                    setShowNewEntry(true);
                                                    setTitle(selectedEntry.title || '');
                                                    setNewEntry(selectedEntry.content);
                                                }}
                                                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                aria-label="Edit entry"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(selectedEntry.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2"
                                                aria-label="Delete entry"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Entry body */}
                                    <div className="px-7 py-6">
                                        <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">
                                            {selectedEntry.content}
                                        </p>
                                    </div>

                                    {/* Reader footer */}
                                    <div className="px-7 py-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400">
                                        <FileText className="w-3.5 h-3.5" />
                                        <span>
                                            {selectedEntry.content.trim().split(/\s+/).length} words
                                        </span>
                                        <span className="w-px h-3 bg-gray-200" />
                                        <span>{selectedEntry.content.length} characters</span>
                                    </div>
                                </motion.div>
                            ) : !showNewEntry ? (
                                <motion.div
                                    key="empty-reader"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="h-full min-h-[400px] bg-white border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center p-10"
                                >
                                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                                        <BookOpen className="w-7 h-7 text-gray-300" />
                                    </div>
                                    <p className="text-gray-400 text-sm font-medium">Select an entry to read it here</p>
                                    <p className="text-gray-300 text-xs mt-1">or create a new one above</p>
                                </motion.div>
                            ) : null}
                        </AnimatePresence>
                    </div>
                </div>

                {/* ── Privacy Footer ───────────────────────────────────── */}
                <div className="flex items-center gap-2 text-xs text-gray-400 py-2 border-t border-gray-100">
                    <Shield className="w-3.5 h-3.5" />
                    <span>All entries are encrypted and stored privately. Only you can access them.</span>
                </div>
            </div>
        </div>
    );
};

export default JournalPage;
