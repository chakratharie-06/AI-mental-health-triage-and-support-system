import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, TrendingUp, Activity, Shield, BarChart3 } from 'lucide-react';

/**
 * AdminDashboard - Standalone System Analytics Interface
 * 
 * Internal-use dashboard for aggregated, anonymized system metrics.
 * Strict privacy compliance - no personally identifiable information.
 */
function AdminDashboard() {
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const response = await axios.get('/api/admin/insights');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to load admin stats:', error);
        } finally {
            setLoading(false);
        }
    };

    // Mock data for demonstration
    const mockStats = {
        totalUsers: 1247,
        activeToday: 89,
        totalSessions: 5632,
        averageSessionLength: "12 min",
        distressDistribution: [
            { level: "Low", count: 3421, color: "bg-green-500" },
            { level: "Moderate", count: 1876, color: "bg-yellow-500" },
            { level: "High", count: 335, color: "bg-red-500" }
        ],
        topMoods: [
            { mood: "Calm", count: 2145 },
            { mood: "Anxious", count: 1876 },
            { mood: "Sad", count: 987 }
        ]
    };

    const data = stats || mockStats;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-zinc-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/chat')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-zinc-900 rounded-xl flex items-center justify-center">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-800">Admin Dashboard</h1>
                            <p className="text-xs text-gray-600">System Analytics (Anonymized)</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Privacy notice */}
                <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-200 flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Privacy-First Analytics</p>
                        <p className="text-blue-700">
                            All data shown is aggregated and anonymized. No personally identifiable information is displayed or stored.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 border-4 border-slate-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading system metrics...</p>
                    </div>
                ) : (
                    <>
                        {/* Key metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                                        <Users className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Total Users</p>
                                        <p className="text-2xl font-bold text-gray-800">{data.totalUsers}</p>
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
                                        <Activity className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Active Today</p>
                                        <p className="text-2xl font-bold text-gray-800">{data.activeToday}</p>
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
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                                        <BarChart3 className="w-6 h-6 text-white" />
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
                                transition={{ delay: 0.3 }}
                                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                                        <TrendingUp className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Avg Session</p>
                                        <p className="text-2xl font-bold text-gray-800">{data.averageSessionLength}</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Distress distribution */}
                        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg mb-8">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Distress Level Distribution</h2>
                            <div className="space-y-4">
                                {data.distressDistribution.map((item, index) => (
                                    <div key={index}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-gray-700 font-medium">{item.level}</span>
                                            <span className="text-gray-600">{item.count} sessions</span>
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

                        {/* Top moods */}
                        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Most Common Moods</h2>
                            <div className="space-y-3">
                                {data.topMoods.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                        <span className="font-medium text-gray-800">{item.mood}</span>
                                        <span className="text-gray-600">{item.count} occurrences</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;
