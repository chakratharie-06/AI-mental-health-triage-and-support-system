import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Thermometer, FileText, CheckCircle2, Info, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';

const MoodTrackingPage = () => {
    const navigate = useNavigate();
    const [selectedMood, setSelectedMood] = useState(null);
    const [intensity, setIntensity] = useState(5);
    const [notes, setNotes] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Highly stylized mood configurations
    const moods = [
        { 
            emoji: '😢', 
            label: 'Very Sad', 
            value: 'very_sad',
            styles: {
                base: 'hover:bg-indigo-50 hover:border-indigo-300',
                active: 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-200 shadow-lg shadow-indigo-100',
                text: 'text-indigo-900',
                pulse: 'bg-indigo-400'
            }
        },
        { 
            emoji: '😔', 
            label: 'Sad', 
            value: 'sad',
            styles: {
                base: 'hover:bg-sky-50 hover:border-sky-300',
                active: 'bg-sky-50 border-sky-400 ring-2 ring-sky-200 shadow-lg shadow-sky-100',
                text: 'text-sky-900',
                pulse: 'bg-sky-400'
            }
        },
        { 
            emoji: '😐', 
            label: 'Neutral', 
            value: 'neutral',
            styles: {
                base: 'hover:bg-gray-50 hover:border-gray-300',
                active: 'bg-gray-50 border-gray-400 ring-2 ring-gray-200 shadow-lg shadow-gray-100',
                text: 'text-gray-900',
                pulse: 'bg-gray-400'
            }
        },
        { 
            emoji: '😊', 
            label: 'Happy', 
            value: 'happy',
            styles: {
                base: 'hover:bg-emerald-50 hover:border-emerald-300',
                active: 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-200 shadow-lg shadow-emerald-100',
                text: 'text-emerald-900',
                pulse: 'bg-emerald-400'
            }
        },
        { 
            emoji: '😄', 
            label: 'Very Happy', 
            value: 'very_happy',
            styles: {
                base: 'hover:bg-amber-50 hover:border-amber-300',
                active: 'bg-amber-50 border-amber-400 ring-2 ring-amber-200 shadow-lg shadow-amber-100',
                text: 'text-amber-900',
                pulse: 'bg-amber-400'
            }
        },
    ];

    const getSelectedMoodStyles = () => {
        const found = moods.find(m => m.value === selectedMood);
        return found ? found.styles : { pulse: 'bg-violet-500' }; // Default fallback color
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedMood) {
            alert('Please select a mood to ground your evaluation.');
            return;
        }

        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            await axios.post(
                'http://localhost:5000/api/mood',
                { mood: selectedMood, intensity, notes },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setShowSuccess(true);

            // Navigate to chat after presentation transition, passing complex context
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
            }, 1800);

        } catch (error) {
            console.error('Error saving mood:', error);
            setIsSubmitting(false);
            alert('Encountered an error logging this event. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col">
            <Navbar />

            <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-10 relative">
                
                {/* Back button top left overlay */}
                <button 
                    onClick={() => navigate(-1)}
                    className="absolute top-10 left-0 hidden md:flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-gray-900 hover:bg-white rounded-full transition-all border border-transparent hover:border-gray-200 shadow-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Back</span>
                </button>

                {/* Core Header */}
                <div className="text-center mb-10 max-w-xl mx-auto mt-4 md:mt-0">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-3">
                        Clinical Emotion Audit
                    </h1>
                    <p className="text-base text-gray-500">
                        Record your current psychological state to establish an accurate baseline for our AI support engine.
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {!showSuccess ? (
                        <motion.div 
                            key="form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                            transition={{ duration: 0.4 }}
                            className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-[2rem] shadow-xl shadow-gray-200/50 p-6 md:p-10 max-w-2xl mx-auto"
                        >
                            <form onSubmit={handleSubmit} className="space-y-10">
                                
                                {/* 1. Mood Classification Selector */}
                                <div>
                                    <div className="flex items-center gap-2 mb-5">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-violet-50`}>
                                            <span className="text-violet-600 font-bold text-sm">1</span>
                                        </div>
                                        <h2 className="text-lg font-bold text-gray-900">Establish Core Emotion</h2>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        {moods.map((mood) => {
                                            const isSelected = selectedMood === mood.value;
                                            return (
                                                <button
                                                    key={mood.value}
                                                    type="button"
                                                    onClick={() => setSelectedMood(mood.value)}
                                                    className={`
                                                        relative flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 ease-out 
                                                        ${isSelected ? mood.styles.active : 'border-gray-100 bg-white hover:border-gray-200 shadow-sm hover:shadow'}
                                                    `}
                                                >
                                                    <motion.span 
                                                        animate={{ scale: isSelected ? 1.25 : 1 }}
                                                        className="text-4xl z-10"
                                                    >
                                                        {mood.emoji}
                                                    </motion.span>
                                                    <span className={`text-sm font-semibold z-10 ${isSelected ? mood.styles.text : 'text-gray-500'}`}>
                                                        {mood.label}
                                                    </span>
                                                    
                                                    {/* Subtle background glow effect if selected */}
                                                    {isSelected && (
                                                        <motion.div 
                                                            layoutId="activeGlow"
                                                            className="absolute inset-0 rounded-2xl bg-white/40"
                                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                        />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* 2. Intensity Slider */}
                                <div>
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-violet-50">
                                                <span className="text-violet-600 font-bold text-sm">2</span>
                                            </div>
                                            <h2 className="text-lg font-bold text-gray-900">Quantify Intensity</h2>
                                        </div>
                                        <div className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${selectedMood ? getSelectedMoodStyles().pulse + " text-white" : "bg-gray-100 text-gray-500"}`}>
                                            Scale: {intensity} / 10
                                        </div>
                                    </div>

                                    <div className="px-2">
                                        <input
                                            type="range"
                                            min="1"
                                            max="10"
                                            value={intensity}
                                            onChange={(e) => setIntensity(parseInt(e.target.value))}
                                            className={`w-full h-3 rounded-xl appearance-none cursor-pointer transition-colors duration-300 ${selectedMood ? getSelectedMoodStyles().pulse : 'bg-gray-200 accent-gray-400'}`}
                                            style={{
                                                accentColor: selectedMood ? undefined : '#9CA3AF'
                                            }}
                                        />
                                        <div className="flex justify-between items-center text-xs font-medium text-gray-400 mt-4 px-1">
                                            <span className="flex flex-col items-start gap-1"><span>Mildly</span><span>Noticeable</span></span>
                                            <span className="flex flex-col items-center gap-1"><span>Moderate</span><span>Disruption</span></span>
                                            <span className="flex flex-col items-end gap-1"><span>Highly</span><span>Overwhelming</span></span>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Clinical Context Array */}
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-violet-50">
                                            <span className="text-violet-600 font-bold text-sm">3</span>
                                        </div>
                                        <h2 className="text-lg font-bold text-gray-900">Contextual Triggers</h2>
                                        <span className="text-sm text-gray-400 font-normal ml-2">(Optional)</span>
                                    </div>
                                    <textarea
                                        id="notes"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Record any specific thoughts, events, or physical sensations occurring alongside this emotion..."
                                        rows="3"
                                        className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all resize-none shadow-inner"
                                    />
                                </div>

                                {/* Submission Engine */}
                                <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-6">
                                    <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                                        <Info className="w-4 h-4 text-violet-400" />
                                        <span>Data is securely logged for your AI context.</span>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!selectedMood || isSubmitting}
                                        className={`
                                            flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-lg md:ml-auto w-full md:w-auto transition-all shadow-lg
                                            ${!selectedMood 
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
                                                : isSubmitting 
                                                    ? 'bg-violet-400 text-white cursor-wait'
                                                    : 'bg-violet-600 hover:bg-violet-700 text-white hover:shadow-violet-200 hover:-translate-y-0.5'}
                                        `}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Processing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Finalize Log</span>
                                                <ArrowRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="success"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ type: "spring", damping: 20, stiffness: 100 }}
                            className="bg-white/90 backdrop-blur-xl border border-emerald-100 rounded-[2rem] shadow-2xl shadow-emerald-200/40 p-12 max-w-lg mx-auto text-center flex flex-col items-center"
                        >
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                                className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6"
                            >
                                <CheckCircle2 className="w-12 h-12" />
                            </motion.div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Audit Captured Successfully</h2>
                            <p className="text-gray-500 mb-8 max-w-sm">
                                Your emotional baseline has been securely recorded. Initializing a customized therapeutic discussion context...
                            </p>
                            <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 1.5, ease: "linear" }}
                                    className="h-full bg-emerald-500"
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default MoodTrackingPage;
