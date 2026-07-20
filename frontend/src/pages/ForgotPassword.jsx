import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { motion } from 'framer-motion';
import { Mail, AlertCircle, CheckCircle2, ArrowLeft, Sparkles } from 'lucide-react';

function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [devResetLink, setDevResetLink] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setDevResetLink('');
        setLoading(true);

        try {
            const response = await authService.forgotPassword(email);
            setSuccess(true);
            if (response.dev_reset_link) {
                setDevResetLink(response.dev_reset_link);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to request password reset');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-primary-100 blur-[100px] opacity-60"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-secondary-100 blur-[120px] opacity-60"></div>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden relative z-10 border border-slate-100"
            >
                {/* Header */}
                <div className="bg-gradient-to-br from-primary-600 to-secondary-600 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')]"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 shadow-inner border border-white/30">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Reset Password</h1>
                        <p className="text-primary-100 text-sm">We'll send you a link to reset it.</p>
                    </div>
                </div>

                <div className="p-8">
                    <button 
                        onClick={() => navigate('/signin')}
                        className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to sign in
                    </button>

                    {error && (
                        <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-danger-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-danger-700">{error}</p>
                        </div>
                    )}

                    {success ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center"
                        >
                            <div className="w-16 h-16 bg-success-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-success-100">
                                <CheckCircle2 className="w-8 h-8 text-success-500" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Check your email</h3>
                            <p className="text-sm text-gray-600 mb-6">
                                We've sent password reset instructions to <strong>{email}</strong>
                            </p>
                            
                            {devResetLink && (
                                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-left">
                                    <p className="text-xs text-amber-800 font-semibold mb-2 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" /> Developer Mode Active
                                    </p>
                                    <p className="text-xs text-amber-700 mb-2">Simulated email delivery. Click the link below to reset your password:</p>
                                    <a href={devResetLink} className="text-xs text-primary-600 font-medium break-all hover:underline">
                                        {devResetLink}
                                    </a>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !email}
                                className="w-full py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-secondary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                            >
                                {loading ? 'Sending link...' : 'Send reset link'}
                            </button>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

export default ForgotPassword;
