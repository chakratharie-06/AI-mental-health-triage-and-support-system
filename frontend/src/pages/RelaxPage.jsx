import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Waves, CloudRain, Wind, Music } from 'lucide-react';

/**
 * RelaxPage - Standalone Relaxation & Mindfulness Interface
 * 
 * A soothing space for stress relief and mental calm.
 * Features ambient soundscapes and breathing exercises.
 */
function RelaxPage() {
    const navigate = useNavigate();

    // Audio state
    const [playing, setPlaying] = useState(null);
    const [volume, setVolume] = useState(0.5);
    const [muted, setMuted] = useState(false);
    const audioRef = useRef(null);

    // Soundscapes
    const soundscapes = [
        {
            id: 'ocean',
            name: 'Ocean Waves',
            description: 'Gentle waves lapping on the shore',
            icon: Waves,
            color: 'from-blue-500 to-cyan-600',
            bgColor: 'bg-blue-50',
            // In production, use actual audio files
            audioUrl: '/sounds/ocean.mp3'
        },
        {
            id: 'rain',
            name: 'Rainfall',
            description: 'Soft rain on a quiet afternoon',
            icon: CloudRain,
            color: 'from-gray-500 to-blue-600',
            bgColor: 'bg-gray-50',
            audioUrl: '/sounds/rain.mp3'
        },
        {
            id: 'forest',
            name: 'Forest Breeze',
            description: 'Wind through the trees',
            icon: Wind,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'bg-green-50',
            audioUrl: '/sounds/forest.mp3'
        },
        {
            id: 'meditation',
            name: 'Meditation Music',
            description: 'Calming instrumental tones',
            icon: Music,
            color: 'from-purple-500 to-pink-600',
            bgColor: 'bg-purple-50',
            audioUrl: '/sounds/meditation.mp3'
        }
    ];

    // Play/pause soundscape
    const togglePlay = (soundscape) => {
        if (playing === soundscape.id) {
            audioRef.current?.pause();
            setPlaying(null);
        } else {
            // In production, load and play actual audio
            setPlaying(soundscape.id);
            // audioRef.current = new Audio(soundscape.audioUrl);
            // audioRef.current.volume = muted ? 0 : volume;
            // audioRef.current.loop = true;
            // audioRef.current.play();
        }
    };

    // Toggle mute
    const toggleMute = () => {
        setMuted(!muted);
        if (audioRef.current) {
            audioRef.current.volume = !muted ? 0 : volume;
        }
    };

    // Handle volume change
    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (audioRef.current && !muted) {
            audioRef.current.volume = newVolume;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/chat')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Waves className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-800">Relaxation Zone</h1>
                            <p className="text-xs text-gray-600">Find your calm</p>
                        </div>
                    </div>

                    {/* Volume controls */}
                    {playing && (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={toggleMute}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                {muted ? (
                                    <VolumeX className="w-5 h-5 text-gray-600" />
                                ) : (
                                    <Volume2 className="w-5 h-5 text-gray-600" />
                                )}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="w-24"
                            />
                        </div>
                    )}
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Introduction */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-800 mb-3">
                        Take a Moment to Breathe
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Choose a soundscape to help you relax, focus, or meditate.
                        Let the calming sounds wash away stress and bring peace to your mind.
                    </p>
                </div>

                {/* Soundscapes grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {soundscapes.map((soundscape, index) => {
                        const Icon = soundscape.icon;
                        const isPlaying = playing === soundscape.id;

                        return (
                            <motion.div
                                key={soundscape.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`relative overflow-hidden rounded-2xl border-2 transition-all ${isPlaying
                                        ? 'border-indigo-500 shadow-2xl scale-105'
                                        : 'border-gray-200 hover:border-indigo-300 hover:shadow-lg'
                                    }`}
                            >
                                <div className={`${soundscape.bgColor} p-8`}>
                                    <div className={`w-16 h-16 bg-gradient-to-br ${soundscape.color} rounded-2xl flex items-center justify-center mb-4`}>
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>

                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                        {soundscape.name}
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        {soundscape.description}
                                    </p>

                                    <button
                                        onClick={() => togglePlay(soundscape)}
                                        className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${isPlaying
                                                ? 'bg-gray-800 text-white hover:bg-gray-900'
                                                : `bg-gradient-to-r ${soundscape.color} text-white hover:shadow-lg`
                                            }`}
                                    >
                                        {isPlaying ? (
                                            <>
                                                <Pause className="w-5 h-5" />
                                                <span>Pause</span>
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-5 h-5" />
                                                <span>Play</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Animated background for playing state */}
                                {isPlaying && (
                                    <motion.div
                                        className="absolute inset-0 pointer-events-none"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 animate-pulse"></div>
                                    </motion.div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Breathing exercise */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-gray-800 mb-3">
                            Simple Breathing Exercise
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Follow this pattern to calm your mind and reduce stress
                        </p>

                        <div className="max-w-md mx-auto space-y-4">
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                                <p className="font-semibold text-blue-900 mb-1">1. Breathe In</p>
                                <p className="text-sm text-blue-700">Slowly inhale through your nose for 4 counts</p>
                            </div>

                            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                                <p className="font-semibold text-purple-900 mb-1">2. Hold</p>
                                <p className="text-sm text-purple-700">Hold your breath gently for 4 counts</p>
                            </div>

                            <div className="p-4 bg-pink-50 rounded-xl border border-pink-200">
                                <p className="font-semibold text-pink-900 mb-1">3. Breathe Out</p>
                                <p className="text-sm text-pink-700">Slowly exhale through your mouth for 6 counts</p>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <p className="font-semibold text-gray-900 mb-1">4. Repeat</p>
                                <p className="text-sm text-gray-700">Continue for 5-10 minutes or until you feel calm</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tips */}
                <div className="mt-8 p-6 bg-indigo-50 rounded-xl border border-indigo-100">
                    <h4 className="font-semibold text-indigo-900 mb-3">💡 Relaxation Tips</h4>
                    <ul className="space-y-2 text-sm text-indigo-800">
                        <li>• Find a quiet, comfortable space where you won't be disturbed</li>
                        <li>• Use headphones for a more immersive experience</li>
                        <li>• Close your eyes and focus on the sounds or your breathing</li>
                        <li>• Practice regularly - even 5 minutes daily can make a difference</li>
                        <li>• Be patient with yourself - relaxation is a skill that improves with practice</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default RelaxPage;
