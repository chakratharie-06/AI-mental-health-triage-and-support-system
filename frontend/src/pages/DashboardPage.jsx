import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsService } from '../services/api';
import { Activity, Heart, TrendingUp, MessageCircle, BookOpen, Wind, Phone, ClipboardList } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import BurnoutPredictor from '../components/mental-health/BurnoutPredictor';
import MicroTherapy from '../components/core/MicroTherapy';

const DashboardPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalSessions: 0,
        currentStreak: 0,
        wellbeingScore: 0,
        dominantMood: 'Calm'
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    const isProfessional = user?.age_group === '25-35' || user?.age_group === '35-45';

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const data = await analyticsService.getAnalytics();

            setStats({
                totalSessions: data.totalSessions || 0,
                currentStreak: data.currentStreak || 0,
                wellbeingScore: data.wellbeingScore || 7.5,
                dominantMood: data.averageMood || 'Calm'
            });

            if (data.recentActivity && data.recentActivity.length > 0) {
                setRecentActivity(data.recentActivity);
            } else {
                setRecentActivity([{ type: 'system', text: 'Welcome to Care Nest! Take a minute to check your wellbeing.', time: 'Just now' }]);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    const quickActions = [
        {
            title: 'Assessment',
            description: 'Check your mental wellbeing',
            icon: ClipboardList,
            color: 'bg-primary-600',
            path: '/assessment'
        },
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
                    <div className="card group bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Total Sessions</p>
                                <p className="text-3xl font-heading font-bold text-primary-700">
                                    {stats.totalSessions}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                                <Activity className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="card group bg-gradient-to-br from-secondary-50 to-secondary-100 border-secondary-200 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Current Streak</p>
                                <p className="text-3xl font-heading font-bold text-secondary-700">
                                    {stats.currentStreak} days
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-secondary-500 rounded-lg flex items-center justify-center transform group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="card group bg-gradient-to-br from-green-50 to-green-100 border-success-base hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Wellbeing Score</p>
                                <p className="text-3xl font-heading font-bold text-success-dark">
                                    {stats.wellbeingScore}/10
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-success-base rounded-lg flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                                <Heart className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="card group bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Dominant Mood</p>
                                <p className="text-2xl font-heading font-bold text-amber-700">
                                    {stats.dominantMood}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center text-2xl transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                                😊
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Column 1 & 2 */}
                    <div className="lg:col-span-2 space-y-6">
                        {isProfessional && <BurnoutPredictor stressLevel={68} />}
                        
                        <div className="card">
                            <h2 className="text-2xl font-heading font-semibold mb-6">Quick Actions</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {quickActions.map((action, index) => {
                                    const Icon = action.icon;
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => navigate(action.path)}
                                            className="group flex items-start gap-4 p-4 rounded-xl bg-white border border-gray-100 hover:border-transparent hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 text-left relative overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                            <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm relative z-10`}>
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="relative z-10 flex-1 pr-6">
                                                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors duration-200">{action.title}</h3>
                                                <p className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors duration-200">{action.description}</p>
                                            </div>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-4 transition-all duration-300 text-primary-500">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Column 3 */}
                    <div className="space-y-6">
                        {isProfessional && <MicroTherapy />}
                        
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
