import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsService } from '../services/api';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, BarChart3, Calendar, Smile, Flame, Activity } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * AnalyticsPage - Standalone Mood & Wellness Tracking Interface
 * 
 * A professional, clinical-grade dashboard that plots exact wellbeing metrics,
 * AI insights, check-in streaks, and time spent using the application.
 */
function AnalyticsPage() {
    const navigate = useNavigate();

    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState(30); // Default to 30 days as requested

    useEffect(() => {
        loadAnalytics(timeRange);
    }, [timeRange]);

    const loadAnalytics = async (days) => {
        try {
            setLoading(true);
            const data = await analyticsService.getAnalytics(days);
            setAnalytics(data);
        } catch (error) {
            console.error('Failed to load analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fallback data if API fails or is empty
    const mockData = {
        totalSessions: 0,
        averageMood: 'Neutral',
        wellbeingScore: 5.0,
        currentStreak: 0,
        totalTimeSpent: 0,
        moodDistribution: [],
        weeklyTrend: [],
        weeklyTimeTrend: []
    };

    const data = analytics || mockData;

    // Smart Insights Generation Core
    const generateSmartInsights = () => {
        const insights = [];
        
        // 1. Consistency & Streak Insight
        if (data.currentStreak > 3) {
            insights.push(`🔥 Incredible momentum! You have a ${data.currentStreak}-day check-in streak. Continuity is the key to deep emotional awareness.`);
        } else if (data.currentStreak === 1) {
            insights.push(`🌱 Great job checking in today. Building a daily habit helps you identify emotional triggers faster.`);
        } else {
            insights.push(`💡 We haven't seen you consistently lately. Even a 30-second daily mood log can drastically improve your wellbeing tracking.`);
        }

        // 2. Wellbeing & Mood Insight
        if (data.wellbeingScore >= 8) {
            insights.push(`✨ Your Wellbeing Score is highly elevated at ${data.wellbeingScore}/10. Your resilience during this period is fantastic.`);
        } else if (data.wellbeingScore <= 4) {
            insights.push(`💙 Your Wellbeing Score is ${data.wellbeingScore}/10 indicating significant recent distress. Please prioritize rest, self-care, or reaching out to a support network today.`);
        } else {
            insights.push(`⚖️ Your emotional state is hovering around a balanced baseline. Continue monitoring any subtle shifts in your mood.`);
        }

        // 3. Time Investment Insight
        if (data.totalTimeSpent > 30) {
            insights.push(`⏳ You invested ${data.totalTimeSpent} minutes into your mental health this week. This dedicated time is a massive investment in your future self.`);
        } else if (data.totalTimeSpent > 0 && data.totalTimeSpent <= 15) {
            insights.push(`⏱️ You spent a brief ${data.totalTimeSpent} minutes engaging with Care Nest. Try exploring the Journal or Relax pages if you need more structured support.`);
        }
        
        if (insights.length === 0) {
            insights.push(`• Record your moods daily to unlock deeper personalized insights here!`);
        }

        return insights;
    };

    // Circular Progress UI component
    const CircularProgress = ({ score, colorClass }) => {
        const percentage = (score / 10) * 100;
        const strokeDasharray = `${percentage} ${100 - percentage}`;
        return (
            <div className="relative w-16 h-16">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                        className="text-gray-100"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                        className={colorClass}
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeDasharray={strokeDasharray}
                        strokeLinecap="round"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-bold text-gray-800 text-sm">
                    {score.toFixed(1)}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Elegant Header */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200 px-4 py-5 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/chat')}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-200">
                            <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Clinical Analytics</h1>
                            <p className="text-sm text-gray-500">Professional dynamic wellbeing tracking</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <select 
                            value={timeRange} 
                            onChange={(e) => setTimeRange(Number(e.target.value))}
                            className="bg-gray-100 border-none rounded-lg px-4 py-2 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-violet-500 outline-none cursor-pointer"
                        >
                            <option value={7}>Last 7 Days</option>
                            <option value={30}>Last 30 Days</option>
                            <option value={90}>Last 3 Months</option>
                            <option value={365}>Last Year</option>
                        </select>
                    </div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {loading ? (
                    <div className="text-center py-32 flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 font-medium">Synthesizing your insights...</p>
                    </div>
                ) : (
                    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} transition={{duration: 0.4}}>
                        {/* Elite Top Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {/* Wellbeing Score Card */}
                            <motion.div
                                whileHover={{ y: -4 }}
                                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between"
                            >
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Activity className="w-4 h-4 text-violet-500" />
                                        <p className="text-sm font-semibold text-gray-500">Wellbeing Score</p>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1 max-w-[140px]">Algorithm calculated baseline index</p>
                                </div>
                                <CircularProgress 
                                    score={data.wellbeingScore} 
                                    colorClass={data.wellbeingScore >= 7 ? 'text-emerald-500' : data.wellbeingScore >= 4 ? 'text-amber-500' : 'text-red-500'} 
                                />
                            </motion.div>

                            {/* Momentum / Streak Card */}
                            <motion.div
                                whileHover={{ y: -4 }}
                                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-5"
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${data.currentStreak > 0 ? 'bg-orange-100' : 'bg-gray-100'}`}>
                                    <Flame className={`w-7 h-7 ${data.currentStreak > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-500">Current Streak</p>
                                    <div className="flex items-end gap-1">
                                        <p className="text-3xl font-bold text-gray-900 leading-none">{data.currentStreak}</p>
                                        <p className="text-sm text-gray-400 mb-1">Days</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Average Mood Card */}
                            <motion.div
                                whileHover={{ y: -4 }}
                                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-5"
                            >
                                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center">
                                    <Smile className="w-7 h-7 text-indigo-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-500">Average Mood</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{data.averageMood}</p>
                                </div>
                            </motion.div>
                        </div>

                        {/* Middle Section: Double Graphs */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            
                            {/* Recharts: AreaChart for Mood Trend */}
                            <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm flex flex-col">
                                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-violet-500" />
                                    Weekly Mood Landscape
                                </h2>
                                <div className="flex-1 w-full min-h-[250px]">
                                    {data.weeklyTrend && data.weeklyTrend.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={data.weeklyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} domain={[0, 10]} />
                                                <Tooltip 
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    cursor={{ stroke: '#C4B5FD', strokeWidth: 1, strokeDasharray: '4 4' }}
                                                />
                                                <Area type="monotone" dataKey="mood" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorMood)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No mood data recorded this week.</div>
                                    )}
                                </div>
                            </div>

                            {/* Recharts: BarChart for Time Spent */}
                            <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm flex flex-col">
                                <div className="flex justify-between items-start mb-6">
                                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-fuchsia-500" />
                                        Daily App Engagement
                                    </h2>
                                    <div className="bg-fuchsia-50 px-3 py-1 rounded-full">
                                        <span className="text-xs font-bold text-fuchsia-700">{data.totalTimeSpent} mins total</span>
                                    </div>
                                </div>
                                <div className="flex-1 w-full min-h-[250px]">
                                    {data.weeklyTimeTrend && data.weeklyTimeTrend.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={data.weeklyTimeTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                                                <Tooltip 
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    cursor={{ fill: '#FDF4FF' }}
                                                    formatter={(value) => [`${value} mins`, 'Interaction Time']}
                                                />
                                                <Bar dataKey="minutes" fill="#d946ef" radius={[6, 6, 0, 0]} maxBarSize={40} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No engagement time recorded this week.</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Bottom Section: Dynamic Smart Insights */}
                        <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-3xl p-8 text-white shadow-xl shadow-violet-200">
                            <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                                💡 Smart AI Insights
                            </h3>
                            <div className="space-y-4">
                                {generateSmartInsights().map((insight, idx) => (
                                    <motion.div 
                                        initial={{ opacity: 0, x: -10 }} 
                                        animate={{ opacity: 1, x: 0 }} 
                                        transition={{ delay: 0.2 + (idx * 0.1) }}
                                        key={idx} 
                                        className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 flex gap-3"
                                    >
                                        <p className="text-violet-50 text-sm leading-relaxed">{insight}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                    </motion.div>
                )}
            </div>
        </div>
    );
}

export default AnalyticsPage;
