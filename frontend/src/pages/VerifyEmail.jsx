import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/api';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

function VerifyEmail() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid or missing verification link.');
            return;
        }

        const verify = async () => {
            try {
                await authService.verifyEmail(token);
                setStatus('success');
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.error || 'Verification failed.');
            }
        };

        verify();
    }, [token]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-slate-100"
            >
                {status === 'loading' && (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Verifying Email...</h2>
                        <p className="text-gray-600">Please wait while we verify your account.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-success-50 rounded-full flex items-center justify-center mb-4 border border-success-100">
                            <CheckCircle2 className="w-8 h-8 text-success-500" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Email Verified!</h2>
                        <p className="text-gray-600 mb-6">Your account is now fully active.</p>
                        <button
                            onClick={() => navigate('/signin')}
                            className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-secondary-700 transition-all shadow-lg"
                        >
                            Proceed to Sign In <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-danger-50 rounded-full flex items-center justify-center mb-4 border border-danger-100">
                            <AlertCircle className="w-8 h-8 text-danger-500" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Verification Failed</h2>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <button
                            onClick={() => navigate('/signin')}
                            className="py-2.5 px-6 bg-primary-50 text-primary-700 font-semibold rounded-xl hover:bg-primary-100 transition-colors"
                        >
                            Back to Sign In
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

export default VerifyEmail;
