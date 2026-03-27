import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const MoodTrackingPage = () => {
    const navigate = useNavigate();
    const [selectedMood, setSelectedMood] = useState(null);
    const [intensity, setIntensity] = useState(5);
    const [notes, setNotes] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const moods = [
        { emoji: '😢', label: 'Very Sad', value: 'very_sad' },
        { emoji: '😔', label: 'Sad', value: 'sad' },
        { emoji: '😐', label: 'Neutral', value: 'neutral' },
        { emoji: '😊', label: 'Happy', value: 'happy' },
        { emoji: '😄', label: 'Very Happy', value: 'very_happy' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedMood) {
            alert('Please select a mood');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post(
                'http://localhost:5000/api/mood',
                { mood: selectedMood, intensity, notes },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setShowSuccess(true);

            // Navigate to chat after 1.2s, passing mood context as router state
            setTimeout(() => {
                const moodObj = moods.find(m => m.value === selectedMood);
                navigate('/chat', {
                    state: {
                        fromMood: true,
                        mood: selectedMood,
                        moodLabel: moodObj?.label || selectedMood,
                        moodEmoji: moodObj?.emoji || '',
                        intensity,
                        notes: notes.trim(),
                    }
                });
            }, 1200);

        } catch (error) {
            console.error('Error saving mood:', error);
            alert('Failed to save mood. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-secondary-50 to-orange-50">
            <Navbar />

            <main className="container mx-auto px-4 py-8 max-w-3xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-heading font-semibold text-gray-900 mb-2">
                        How are you feeling? 
                    </h1>
                    <p className="text-lg text-gray-600">
                        Track your mood to understand your emotional patterns
                    </p>
                </div>

                <div className="card bg-white/80 backdrop-blur-sm">
                    <form onSubmit={handleSubmit}>
                        {/* Mood Selector */}
                        <div className="mb-8">
                            <label className="block text-lg font-semibold text-gray-900 mb-4">
                                Select your mood
                            </label>
                            <div className="grid grid-cols-5 gap-3">
                                {moods.map((mood) => (
                                    <button
                                        key={mood.value}
                                        type="button"
                                        onClick={() => setSelectedMood(mood.value)}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-200 ${selectedMood === mood.value
                                                ? 'border-primary-500 bg-primary-50 shadow-md scale-105'
                                                : 'border-gray-200 hover:border-primary-300 hover:shadow-sm'
                                            }`}
                                        aria-label={mood.label}
                                        aria-pressed={selectedMood === mood.value}
                                    >
                                        <span className="text-4xl">{mood.emoji}</span>
                                        <span className="text-xs font-medium text-gray-700">{mood.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Intensity Slider */}
                        <div className="mb-8">
                            <label className="block text-lg font-semibold text-gray-900 mb-4">
                                Intensity: {intensity}/10
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={intensity}
                                onChange={(e) => setIntensity(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                                aria-label="Mood intensity"
                            />
                            <div className="flex justify-between text-sm text-gray-500 mt-2">
                                <span>Mild</span>
                                <span>Moderate</span>
                                <span>Intense</span>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="mb-6">
                            <label htmlFor="notes" className="block text-lg font-semibold text-gray-900 mb-2">
                                Notes (optional)
                            </label>
                            <textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="What's on your mind?"
                                rows="4"
                                className="form-textarea"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={!selectedMood}
                            className="btn btn-primary w-full text-lg"
                        >
                            Save Mood Entry
                        </button>
                    </form>

                    {/* Success Message */}
                    {showSuccess && (
                        <div className="mt-4 bg-success-light border-l-4 border-success-base rounded-lg p-4">
                            <p className="text-success-dark font-semibold flex items-center gap-2">
                                <span>✓</span> Mood saved! Taking you to chat...
                            </p>
                        </div>
                    )}
                </div>

                {/* Info Card */}
                <div className="mt-6 card bg-info-light border-info-base">
                    <div className="flex items-start gap-3">
                        <div className="text-2xl">💡</div>
                        <div>
                            <p className="font-semibold text-gray-900 mb-1">Why track your mood?</p>
                            <p className="text-sm text-gray-700">
                                Regular mood tracking helps you identify patterns, triggers, and progress over time.
                                It's a powerful tool for self-awareness and mental wellness.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MoodTrackingPage;
