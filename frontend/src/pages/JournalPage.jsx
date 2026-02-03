import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';

const JournalPage = () => {
    const [entries, setEntries] = useState([]);
    const [showNewEntry, setShowNewEntry] = useState(false);
    const [newEntry, setNewEntry] = useState('');
    const [loading, setLoading] = useState(true);

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
            setLoading(false);
        } catch (error) {
            console.error('Error fetching journal entries:', error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!newEntry.trim()) return;

        try {
            const token = localStorage.getItem('token');
            await axios.post(
                'http://localhost:5000/api/journal',
                { content: newEntry },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setNewEntry('');
            setShowNewEntry(false);
            fetchEntries();
        } catch (error) {
            console.error('Error saving journal entry:', error);
            alert('Failed to save entry. Please try again.');
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
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
            <Navbar />

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-heading font-semibold text-gray-900 mb-2">
                            Your Journal 📝
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
                    <div className="card bg-white/90 backdrop-blur-sm mb-6">
                        <form onSubmit={handleSubmit}>
                            <h3 className="text-xl font-semibold mb-4">New Journal Entry</h3>
                            <textarea
                                value={newEntry}
                                onChange={(e) => setNewEntry(e.target.value)}
                                placeholder="Write your thoughts here..."
                                rows="8"
                                className="form-textarea mb-4"
                                autoFocus
                            />
                            <div className="flex gap-3">
                                <button type="submit" className="btn btn-primary">
                                    Save Entry
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowNewEntry(false);
                                        setNewEntry('');
                                    }}
                                    className="btn btn-ghost"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Journal Entries */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="card text-center py-12">
                            <p className="text-gray-500">Loading your entries...</p>
                        </div>
                    ) : entries.length === 0 ? (
                        <div className="card text-center py-12 bg-white/80 backdrop-blur-sm">
                            <div className="text-6xl mb-4">📖</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                No entries yet
                            </h3>
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
                                className="card bg-white/80 backdrop-blur-sm border-l-4 border-primary-500 hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <time className="text-sm font-medium text-gray-600">
                                        {new Date(entry.created_at).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </time>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleDelete(entry.id)}
                                            className="p-2 text-gray-400 hover:text-danger-base transition-colors"
                                            aria-label="Delete entry"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
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

                {/* Info Card */}
                <div className="mt-8 card bg-info-light border-info-base">
                    <div className="flex items-start gap-3">
                        <div className="text-2xl">🔒</div>
                        <div>
                            <p className="font-semibold text-gray-900 mb-1">Your privacy matters</p>
                            <p className="text-sm text-gray-700">
                                Your journal entries are private and encrypted. Only you can see them.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default JournalPage;
