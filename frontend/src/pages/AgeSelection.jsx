import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Users, ArrowRight, Info } from 'lucide-react';
import axios from 'axios';

/**
 * AgeSelection Page - Standalone Onboarding Interface
 * 
 * A gentle, optional age group selection for personalized support.
 * Emphasizes user choice and explains the benefit without pressure.
 */
function AgeSelection() {
    const navigate = useNavigate();
    const { token } = useAuth();

    const [selectedAge, setSelectedAge] = useState('');
    const [loading, setLoading] = useState(false);

    const ageGroups = [
        { value: '13-17', label: '13-17', emoji: '🌱', description: 'Teen years' },
        { value: '18-25', label: '18-25', emoji: '🎓', description: 'Young adult' },
        { value: '26-40', label: '26-40', emoji: '💼', description: 'Adult' },
        { value: '41-60', label: '41-60', emoji: '🌟', description: 'Midlife' },
        { value: '60+', label: '60+', emoji: '🌺', description: 'Senior' }
    ];

    const handleContinue = async () => {
        if (!selectedAge) return;

        setLoading(true);

        try {
            await axios.post(
                'http://localhost:5000/api/update-profile',
                { age_group: selectedAge },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            navigate('/chat');
        } catch (error) {
            console.error('Failed to update age group:', error);
            // Continue anyway - age is optional
            navigate('/chat');
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        navigate('/chat');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
            </div>

            {/* Main card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-2xl"
            >
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 border border-white/20">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="inline-block mb-6"
                        >
                            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto">
                                <Users className="w-10 h-10 text-white" />
                            </div>
                        </motion.div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
                            Help Us Personalize Your Experience
                        </h1>
                        <p className="text-gray-600 text-lg max-w-xl mx-auto">
                            Knowing your age group helps us provide more relevant support and resources
                        </p>
                    </div>

                    {/* Info banner */}
                    <div className="mb-8 p-4 bg-primary-50 rounded-xl border border-primary-100 flex items-start gap-3">
                        <Info className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-primary-800">
                            <p className="font-medium mb-1">This is completely optional</p>
                            <p className="text-primary-700">
                                You can skip this step or change it later. Your privacy is our priority.
                            </p>
                        </div>
                    </div>

                    {/* Age group selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        {ageGroups.map((group, index) => (
                            <motion.button
                                key={group.value}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                                onClick={() => setSelectedAge(group.value)}
                                className={`p-6 rounded-2xl border-2 transition-all ${selectedAge === group.value
                                    ? 'border-primary-500 bg-primary-50 shadow-lg scale-105'
                                    : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-md'
                                    }`}
                            >
                                <div className="text-4xl mb-3">{group.emoji}</div>
                                <div className="text-xl font-bold text-gray-800 mb-1">{group.label}</div>
                                <div className="text-sm text-gray-600">{group.description}</div>
                            </motion.button>
                        ))}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={handleSkip}
                            disabled={loading}
                            className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 focus:ring-4 focus:ring-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
                        >
                            Skip for Now
                        </button>
                        <button
                            onClick={handleContinue}
                            disabled={!selectedAge || loading}
                            className="flex-1 py-3 px-6 bg-gradient-to-r from-primary-600 to-primary-600 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-700 focus:ring-4 focus:ring-primary-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Continuing...</span>
                                </>
                            ) : (
                                <>
                                    <span>Continue</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>

                    {/* Privacy note */}
                    <div className="mt-8 p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-600 text-center leading-relaxed">
                            🔒 Your age group is stored securely and used only to personalize your experience.
                            It is never shared with third parties and you can update or remove it anytime.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default AgeSelection;
