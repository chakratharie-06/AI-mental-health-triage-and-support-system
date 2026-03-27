import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, BookOpen, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';

// Mood config — emoji + colour for each detected mood
const MOOD_CONFIG = {
    happy: { emoji: '😊', label: 'Happy', color: 'bg-yellow-100 text-yellow-800' },
    sad: { emoji: '😢', label: 'Sad', color: 'bg-primary-100 text-primary-800' },
    anxious: { emoji: '😰', label: 'Anxious', color: 'bg-orange-100 text-orange-800' },
    stressed: { emoji: '😤', label: 'Stressed', color: 'bg-red-100 text-red-800' },
    calm: { emoji: '😌', label: 'Calm', color: 'bg-green-100 text-green-800' },
    angry: { emoji: '😠', label: 'Angry', color: 'bg-red-200 text-red-900' },
    hopeful: { emoji: '🌟', label: 'Hopeful', color: 'bg-secondary-100 text-secondary-800' },
    neutral: { emoji: '😐', label: 'Neutral', color: 'bg-gray-100 text-gray-700' },
};

// Severity badge config
const SEVERITY_CONFIG = {
    RED: { label: 'High distress', color: 'bg-red-100 text-red-800', border: 'border-red-500' },
    YELLOW: { label: 'Mild distress', color: 'bg-yellow-100 text-yellow-800', border: 'border-yellow-500' },
    GREEN: { label: 'Low distress', color: 'bg-green-100 text-green-800', border: 'border-green-500' },
};


const MoodBadge = ({ mood }) => {
    const cfg = MOOD_CONFIG[mood] || MOOD_CONFIG.neutral;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
            {cfg.emoji} {cfg.label}
        </span>
    );
};

const SeverityBadge = ({ severity }) => {
    const cfg = SEVERITY_CONFIG[severity];
    if (!cfg) return null;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
            {severity === 'RED' ? '🔴' : severity === 'YELLOW' ? '🟡' : '🟢'} {cfg.label}
        </span>
    );
};

const JournalPage = () => {
    const [entries, setEntries] = useState([]);
    const [showNewEntry, setShowNewEntry] = useState(false);
    const [title, setTitle] = useState('');
    const [newEntry, setNewEntry] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');   // e.g. "Entry saved! Mood: Happy 😊"

    useEffect(() => {
        fetchEntries();
    }, []);

    const fetchEntries = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/journal', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEntries(response.data.entries || []);
        } catch (error) {
            console.error('Error fetching journal entries:', error);
        } finally {
            setLoading(false);
        }
    };

    const showSuccess = (msg) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 4000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newEntry.trim()) return;

        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:5000/api/journal',
                { title: title.trim(), content: newEntry.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const detectedMood = response.data.detected_mood || 'neutral';
            const severity = response.data.severity || 'GREEN';
            const moodCfg = MOOD_CONFIG[detectedMood] || MOOD_CONFIG.neutral;
            const sevCfg = SEVERITY_CONFIG[severity];
            const sevIcon = severity === 'RED' ? '🔴' : severity === 'YELLOW' ? '🟡' : '🟢';
            showSuccess(`Saved! Mood: ${moodCfg.emoji} ${moodCfg.label} · Distress: ${sevIcon} ${sevCfg?.label || severity}`);

            setTitle('');
            setNewEntry('');
            setShowNewEntry(false);
            fetchEntries();
        } catch (error) {
            console.error('Error saving journal entry:', error);
            alert('Failed to save entry. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this entry?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/journal/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchEntries();
        } catch (error) {
            console.error('Error deleting entry:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-primary-50 to-primary-50">
            <Navbar />

            <main className="container mx-auto px-4 py-8 max-w-4xl">

                {/* Success Toast */}
                {successMsg && (
                    <div className="mb-4 flex items-center gap-2 p-4 bg-success-light border border-success-base rounded-xl text-green-800 text-sm font-medium animate-fade-in">
                        <CheckCircle className="w-5 h-5 text-success-base flex-shrink-0" />
                        {successMsg}
                    </div>
                )}

                {/* Page Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-heading font-semibold text-gray-900 mb-2">
                            Your Journal
                        </h1>
                        <p className="text-lg text-gray-600">
                            A private space for your thoughts and reflections
                        </p>
                    </div>
                    <button
                        onClick={() => setShowNewEntry(!showNewEntry)}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        New Entry
                    </button>
                </div>

                {/* New Entry Form */}
                {showNewEntry && (
                    <div className="card bg-white/90 backdrop-blur-sm mb-6 border border-emerald-100">
                        <form onSubmit={handleSubmit}>
                            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-emerald-600" />
                                New Journal Entry
                            </h3>

                            {/* Title field */}
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Title <span className="text-gray-400 font-normal">(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Give your entry a title..."
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            {/* Content field */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    What's on your mind?
                                </label>
                                <textarea
                                    value={newEntry}
                                    onChange={(e) => setNewEntry(e.target.value)}
                                    placeholder="Write your thoughts here... the AI will automatically detect your mood from what you write."
                                    rows="8"
                                    className="form-textarea w-full"
                                    autoFocus
                                    required
                                />
                                <p className="mt-1 text-xs text-gray-400">
                                    🧠 Your mood will be automatically detected from your writing
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={saving || !newEntry.trim()}
                                    className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? 'Saving...' : 'Save Entry'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowNewEntry(false); setTitle(''); setNewEntry(''); }}
                                    className="btn btn-ghost"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Journal Entries List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="card text-center py-12">
                            <p className="text-gray-500">Loading your entries...</p>
                        </div>
                    ) : entries.length === 0 ? (
                        <div className="card text-center py-12 bg-white/80 backdrop-blur-sm">
                            <div className="text-6xl mb-4">📖</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No entries yet</h3>
                            <p className="text-gray-600 mb-4">
                                Start journaling to track your thoughts and feelings
                            </p>
                            <button
                                onClick={() => setShowNewEntry(true)}
                                className="btn btn-primary inline-flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Write Your First Entry
                            </button>
                        </div>
                    ) : (
                        entries.map((entry) => (
                            <article
                                key={entry.id}
                                className="card bg-white/80 backdrop-blur-sm border-l-4 border-emerald-500 hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex flex-col gap-1">
                                        {/* Title (if set) */}
                                        {entry.title && (
                                            <h4 className="font-semibold text-gray-900">{entry.title}</h4>
                                        )}
                                        <time className="text-sm text-gray-500">
                                            {new Date(entry.created_at).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </time>
                                        {/* Mood badge + hint */}
                                        {entry.mood_tag && (
                                            <div className="flex flex-wrap gap-1.5 items-center mt-1">
                                                <MoodBadge mood={entry.mood_tag} />
                                                <span className="text-xs text-gray-400">· auto-detected from keywords</span>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleDelete(entry.id)}
                                        className="p-2 text-gray-400 hover:text-danger-base transition-colors"
                                        aria-label="Delete entry"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="prose prose-sm max-w-none">
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {entry.content}
                                    </p>
                                </div>
                            </article>
                        ))
                    )}
                </div>

                {/* Privacy note */}
                <div className="mt-8 card bg-info-light border-info-base">
                    <div className="flex items-start gap-3">
                        <div className="text-2xl">🔒</div>
                        <div>
                            <p className="font-semibold text-gray-900 mb-1">Your privacy matters</p>
                            <p className="text-sm text-gray-700">
                                Your journal entries are private and encrypted. Only you can see them.
                                Mood detection helps track your emotional wellbeing over time.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default JournalPage;
