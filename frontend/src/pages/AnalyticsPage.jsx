import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, BarChart3, Calendar, Smile, Meh, Frown } from 'lucide-react';

/**
 * AnalyticsPage - Standalone Mood & Wellness Tracking Interface
 * 
 * A non-judgmental space to visualize emotional patterns and progress.
 * Empowers users with insights while maintaining privacy.
 */
function AnalyticsPage() {
    const navigate = useNavigate();
    const { token } = useAuth();

    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/analytics', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAnalytics(response.data);
        } catch (error) {
            console.error('Failed to load analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    // Mock data for demonstration
    const mockData = {
        totalSessions: 12,
        averageMood: 'Calm',
        moodDistribution: [
            { mood: 'Happy', count: 3, color: 'bg-success-base' },
            { mood: 'Calm', count: 5, color: 'bg-primary-500' },
            { mood: 'Okay', count: 2, color: 'bg-gray-500' },
            { mood: 'Sad', count: 2, color: 'bg-secondary-500' }
        ],
        weeklyTrend: [
            { day: 'Mon', mood: 7 },
            { day: 'Tue', mood: 6 },
            { day: 'Wed', mood: 8 },
            { day: 'Thu', mood: 7 },
            { day: 'Fri', mood: 9 },
            { day: 'Sat', mood: 8 },
            { day: 'Sun', mood: 7 }
        ]
    };

    const data = analytics || mockData;

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-fuchsia-50">
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
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-xl flex items-center justify-center">
                            <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-800">Wellness Insights</h1>
                            <p className="text-xs text-gray-600">Track your emotional journey</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {loading ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading your insights...</p>
                    </div>
                ) : (
                    <>
                        {/* Summary cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                                        <Calendar className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Total Sessions</p>
                                        <p className="text-2xl font-bold text-gray-800">{data.totalSessions}</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                        <Smile className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Average Mood</p>
                                        <p className="text-2xl font-bold text-gray-800">{data.averageMood}</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center">
                                        <TrendingUp className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">This Week</p>
                                        <p className="text-2xl font-bold text-gray-800">Improving</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Mood distribution */}
                        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg mb-8">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Mood Distribution</h2>
                            <div className="space-y-4">
                                {data.moodDistribution.map((item, index) => (
                                    <div key={index}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-gray-700 font-medium">{item.mood}</span>
                                            <span className="text-gray-600">{item.count} times</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-3">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(item.count / data.totalSessions) * 100}%` }}
                                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                                className={`${item.color} h-3 rounded-full`}
                                            ></motion.div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Weekly trend */}
                        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Weekly Mood Trend</h2>
                            <div className="flex items-end justify-between h-64 gap-2">
                                {data.weeklyTrend.map((day, index) => (
                                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${(day.mood / 10) * 100}%` }}
                                            transition={{ delay: index * 0.1, duration: 0.5 }}
                                            className="w-full bg-gradient-to-t from-violet-600 to-fuchsia-600 rounded-t-lg"
                                        ></motion.div>
                                        <p className="text-sm text-gray-600 font-medium">{day.day}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Insights */}
                        <div className="mt-8 p-6 bg-violet-50 rounded-xl border border-violet-200">
                            <h3 className="font-semibold text-violet-900 mb-3">💡 Insights</h3>
                            <ul className="space-y-2 text-sm text-violet-800">
                                <li>• You've been consistently engaging with your mental health - that's wonderful!</li>
                                <li>• Your mood has shown positive trends this week</li>
                                <li>• Consider journaling on days when you feel less positive to process emotions</li>
                                <li>• Remember: all emotions are valid, and tracking them helps you understand yourself better</li>
                            </ul>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default AnalyticsPage;
