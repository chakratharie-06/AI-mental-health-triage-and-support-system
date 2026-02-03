import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Activity, Heart, TrendingUp, MessageCircle, BookOpen, Wind, Phone } from 'lucide-react';
import Navbar from '../components/Navbar';

const DashboardPage = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalSessions: 0,
        currentStreak: 0,
        wellbeingScore: 0,
        dominantMood: 'Calm'
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/analytics', {
                headers: { Authorization: `Bearer ${token}` }
            });

            setStats({
                totalSessions: response.data.totalSessions || 0,
                currentStreak: 3, // Mock data
                wellbeingScore: 7.5, // Mock data
                dominantMood: response.data.averageMood || 'Calm'
            });

            // Mock recent activity
            setRecentActivity([
                { type: 'chat', text: 'Completed AI chat session', time: '2 hours ago' },
                { type: 'mood', text: 'Logged mood: Happy', time: '5 hours ago' },
                { type: 'journal', text: 'Wrote journal entry', time: '1 day ago' },
            ]);

            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    const quickActions = [
        {
            title: 'AI Chat Support',
            description: 'Talk to our AI companion',
            icon: MessageCircle,
            color: 'bg-primary-500',
            path: '/chat'
        },
        {
            title: 'Track Mood',
            description: 'Log how you\'re feeling',
            icon: Heart,
            color: 'bg-secondary-500',
            path: '/mood'
        },
        {
            title: 'Journal',
            description: 'Write your thoughts',
            icon: BookOpen,
            color: 'bg-accent-warm',
            path: '/journal'
        },
        {
            title: 'Resources',
            description: 'Find professional help',
            icon: Phone,
            color: 'bg-green-500',
            path: '/resources'
        },
        {
            title: 'Relax',
            description: 'Breathing exercises',
            icon: Wind,
            color: 'bg-accent-gentle',
            path: '/relax'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-4xl font-heading font-semibold text-gray-900 mb-2">
                        Welcome back! 👋
                    </h1>
                    <p className="text-lg text-gray-600">
                        Here's your wellbeing overview
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Total Sessions</p>
                                <p className="text-3xl font-heading font-bold text-primary-700">
                                    {stats.totalSessions}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
                                <Activity className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-secondary-50 to-secondary-100 border-secondary-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Current Streak</p>
                                <p className="text-3xl font-heading font-bold text-secondary-700">
                                    {stats.currentStreak} days
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-secondary-500 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Wellbeing Score</p>
                                <p className="text-3xl font-heading font-bold text-green-700">
                                    {stats.wellbeingScore}/10
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                                <Heart className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Dominant Mood</p>
                                <p className="text-2xl font-heading font-bold text-amber-700">
                                    {stats.dominantMood}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center text-2xl">
                                😊
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Quick Actions */}
                    <div className="lg:col-span-2">
                        <div className="card">
                            <h2 className="text-2xl font-heading font-semibold mb-6">Quick Actions</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {quickActions.map((action, index) => {
                                    const Icon = action.icon;
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => navigate(action.path)}
                                            className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200 text-left"
                                        >
                                            <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0`}>
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                                                <p className="text-sm text-gray-600">{action.description}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="card">
                        <h2 className="text-2xl font-heading font-semibold mb-6">Recent Activity</h2>
                        <div className="space-y-4">
                            {recentActivity.map((activity, index) => (
                                <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
                                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">{activity.text}</p>
                                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Motivational Message */}
                <div className="mt-8 card bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200">
                    <div className="flex items-center gap-4">
                        <div className="text-4xl">💙</div>
                        <div>
                            <h3 className="font-heading font-semibold text-lg text-gray-900 mb-1">
                                You're doing great!
                            </h3>
                            <p className="text-gray-600">
                                Remember, taking care of your mental health is a journey, not a destination.
                                We're here to support you every step of the way.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;
