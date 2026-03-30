import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, UserCheck, Accessibility, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function AgeGate() {
    const navigate = useNavigate();
    const location = useLocation();
    const { anonymousLogin } = useAuth();
    const [loading, setLoading] = useState(false);

    // Check if we arrived here from the "Try anonymously" flow
    const isAnonymousFlow = location.state?.anonymous === true;

    const handleSelection = async (ageGroup) => {
        localStorage.setItem('selected_age_group', ageGroup);

        if (isAnonymousFlow) {
            // Anonymous flow: log in silently and go straight to Chat
            setLoading(true);
            try {
                await anonymousLogin();
                navigate('/chat', { replace: true });
            } catch (err) {
                console.error('Anonymous login failed:', err);
                setLoading(false);
            }
        } else {
            // Normal flow: go to Sign Up
            navigate('/signup');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-wysa-bg via-secondary-50 to-secondary-50 flex flex-col items-center justify-center p-4">

            {/* Loading overlay while anonymous login is in progress */}
            {loading && (
                <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-10 h-10 text-violet-600 animate-spin" />
                    <p className="text-sm font-semibold text-gray-600">Setting up your private session...</p>
                </div>
            )}

            {/* Header / Logo */}
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-wysa-teal to-secondary-500 rounded-full mb-6 shadow-xl"
                >
                    <Heart className="text-white" size={48} />
                </motion.div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-wysa-teal to-secondary-600 bg-clip-text text-transparent mb-2">
                    Care Nest
                </h1>
                <p className="text-xl text-gray-500">Your safe space, tailored for you.</p>
            </motion.div>

            {/* Age Selection Boxes */}
            <div className="grid md:grid-cols-2 gap-6 w-full max-w-2xl px-4">

                {/* 13-17 Box */}
                <motion.button
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.05, translateY: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelection('13-17')}
                    className="group bg-white/80 backdrop-blur-lg border-2 border-transparent hover:border-wysa-teal hover:bg-white p-8 rounded-3xl shadow-xl transition-all duration-300 flex flex-col items-center text-center"
                >
                    <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary-100 transition-colors">
                        <Accessibility className="text-primary-500" size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">13 - 17 Years</h3>
                    <p className="text-gray-500">I'm a teen looking for support</p>
                </motion.button>

                {/* 18+ Box */}
                <motion.button
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.05, translateY: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelection('18+')}
                    className="group bg-white/80 backdrop-blur-lg border-2 border-transparent hover:border-secondary-500 hover:bg-white p-8 rounded-3xl shadow-xl transition-all duration-300 flex flex-col items-center text-center"
                >
                    <div className="w-20 h-20 bg-secondary-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-secondary-100 transition-colors">
                        <UserCheck className="text-secondary-500" size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">18 and Above</h3>
                    <p className="text-gray-500">I'm an adult seeking guidance</p>
                </motion.button>

            </div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-12 text-sm text-gray-400"
            >
                We ask this to provide the most relevant support for you.
            </motion.p>
        </div>
    );
}

export default AgeGate;
