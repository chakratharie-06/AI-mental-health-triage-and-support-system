import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { authService } from '../services/api';
import { BookOpen, Briefcase, Home, Shield, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';

const AGE_CATEGORIES = [
    {
        value: '18-25',
        icon: BookOpen,
        color: 'text-violet-600',
        bgColor: 'bg-violet-100',
        ringColor: 'ring-violet-500',
        label: '18 – 25 Years',
        role: 'Mental Coach',
        tagline: 'Navigate studies & life transitions',
        features: ['Study pattern tracking', 'Anxiety & overthinking tools', 'Career clarity support'],
    },
    {
        value: '25-35',
        icon: Briefcase,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        ringColor: 'ring-blue-500',
        label: '25 – 35 Years',
        role: 'Work-Life Coach',
        tagline: 'Balance career & personal growth',
        features: ['Burnout prevention', 'Workplace boundary setting', 'Relationship guidance'],
    },
    {
        value: '35-45',
        icon: Home,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-100',
        ringColor: 'ring-emerald-500',
        label: '35 – 45 Years',
        role: 'Life Load Balancer',
        tagline: 'Manage family & career pressure',
        features: ['Life-load assessment', 'Family mediator strategies', 'Personal time optimization'],
    },
    {
        value: '45+',
        icon: Shield,
        color: 'text-amber-600',
        bgColor: 'bg-amber-100',
        ringColor: 'ring-amber-500',
        label: '45+ Years',
        role: 'Wisdom Companion',
        tagline: 'Clarity, health & life purpose',
        features: ['Decision fatigue reduction', 'Life reflection mapping', 'Meaning & connection building'],
    },
];

export default function AgeSelection() {
    const navigate = useNavigate();
    const { user, token, updateUser } = useAuth();
    const [selected, setSelected] = useState('');
    const [loading, setLoading] = useState(false);

    // Redirect if already has an age group
    useEffect(() => {
        if (user?.age_group) {
            navigate('/dashboard', { replace: true });
        }
    }, [user, navigate]);

    const handleContinue = async () => {
        if (!selected || loading) return;
        setLoading(true);
        try {
            await authService.updateProfile({ age_group: selected });
            updateUser({ age_group: selected });
            navigate('/chat');
        } catch (err) {
            console.error("Profile update failed", err);
            // Still navigate as fallback
            updateUser({ age_group: selected });
            navigate('/chat');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-primary flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
            {/* Animated background blobs matching SignIn aesthetic */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-300/20 rounded-full blur-3xl animate-blob"></div>
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-secondary-300/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
            </div>

            <div className="w-full max-w-5xl relative z-10 flex flex-col items-center">
                
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-10"
                >
                    <div className="inline-flex items-center justify-center p-3.5 bg-white rounded-2xl shadow-sm border border-gray-100 mb-5">
                        <Sparkles className="w-8 h-8 text-primary-600" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
                        Personalize Your Experience
                    </h1>
                    <p className="text-gray-600 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
                        To provide the most relevant support, Care Nest adapts its conversation style, 
                        coping strategies, and daily check-ins to your current life stage.
                    </p>
                </motion.div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full mb-10">
                    {AGE_CATEGORIES.map((cat, i) => {
                        const isSelected = selected === cat.value;
                        const Icon = cat.icon;
                        
                        return (
                            <motion.button
                                key={cat.value}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: i * 0.1 }}
                                onClick={() => setSelected(cat.value)}
                                className={`relative flex flex-col text-left p-6 rounded-2xl transition-all duration-200 border-2 outline-none group ${
                                    isSelected 
                                    ? `bg-white border-transparent ${cat.ringColor} ring-2 ring-offset-2 shadow-xl shrink-0 scale-[1.02]` 
                                    : 'bg-white/60 backdrop-blur-sm border-white hover:bg-white hover:border-gray-100 hover:shadow-lg shadow-sm'
                                }`}
                            >
                                <div className="flex items-start justify-between w-full mb-5">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl flex-shrink-0 ${isSelected ? cat.bgColor : 'bg-gray-50 group-hover:' + cat.bgColor} transition-colors`}>
                                            <Icon className={`w-6 h-6 ${isSelected ? cat.color : 'text-gray-400 group-hover:' + cat.color}`} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{cat.label}</h3>
                                            <p className={`text-sm font-medium ${isSelected ? cat.color : 'text-gray-500 group-hover:' + cat.color}`}>
                                                {cat.role}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0 mt-1">
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                            isSelected ? `border-transparent ${cat.bgColor}` : 'border-gray-200 bg-white'
                                        }`}>
                                            {isSelected && <div className={`w-3 h-3 rounded-full ${cat.bgColor.replace('100', '500')}`} />}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 flex-1">
                                    <p className="text-sm text-gray-600 font-medium mb-1">
                                        {cat.tagline}
                                    </p>
                                    <ul className="space-y-2 mt-auto pt-4 border-t border-gray-100/60">
                                        {cat.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-500">
                                                <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isSelected ? cat.color : 'text-gray-300 group-hover:text-gray-400'}`} />
                                                <span className="leading-tight">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>

                {/* Footer Action */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="flex flex-col items-center w-full"
                >
                    <button
                        onClick={handleContinue}
                        disabled={!selected || loading}
                        className={`group relative flex items-center justify-center gap-2 w-full max-w-sm py-4 px-8 rounded-xl font-bold text-[15px] transition-all duration-300 shadow-md ${
                            selected && !loading
                            ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:from-primary-700 hover:to-secondary-700 hover:shadow-xl hover:-translate-y-0.5' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                        }`}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Setting up...
                            </span>
                        ) : selected ? (
                            <>
                                Start My Journey
                                <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                            </>
                        ) : (
                            'Select an age group to continue'
                        )}
                    </button>
                    
                    <p className="text-xs text-gray-400 mt-6 text-center max-w-sm flex items-center justify-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        You can update your life stage at any time in your profile settings.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}

// Minimal stub for Lucide Lock icon since we forgot to import it above
const Lock = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
);
