import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Heart } from 'lucide-react';

/**
 * SignUp Page - Standalone User Registration Interface
 * 
 * A warm, inviting registration experience for new users.
 * Emphasizes privacy, safety, and ease of onboarding.
 */
function SignUp() {
    const navigate = useNavigate();
    const { register } = useAuth();

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successData, setSuccessData] = useState(null);

    // Password strength calculation
    const getPasswordStrength = (pwd) => {
        if (!pwd) return { level: 0, label: '', color: '' };
        if (pwd.length < 6) return { level: 1, label: 'Weak', color: 'bg-danger-base' };
        if (pwd.length < 10) return { level: 2, label: 'Fair', color: 'bg-warning-base' };
        return { level: 3, label: 'Strong', color: 'bg-success-base' };
    };

    const passwordStrength = getPasswordStrength(formData.password);
    const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;

    // Handle form input
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Handle registration
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match. Please check and try again.');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        if (!agreedToTerms) {
            setError('Please accept the terms and conditions to continue.');
            return;
        }

        setLoading(true);

        try {
            const data = await register(formData.name, formData.email, formData.password);
            setSuccessData(data); // Display the success screen with dev_verify_link
        } catch (err) {
            setError(err.response?.data?.error || 'Unable to create account. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-surface-primary to-secondary-50 flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 right-20 w-64 h-64 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute top-1/3 left-10 w-64 h-64 bg-secondary-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            {successData ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative w-full max-w-md"
                >
                    <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20 text-center">
                        <div className="w-16 h-16 bg-success-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-success-100">
                            <svg className="w-8 h-8 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
                        <p className="text-gray-600 mb-6">
                            We've sent a verification link to <strong>{formData.email}</strong>.
                            Please verify your email address to continue.
                        </p>

                        {successData.dev_verify_link && (
                            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-left mb-6">
                                <p className="text-xs text-amber-800 font-semibold mb-2 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    Developer Mode Active
                                </p>
                                <p className="text-xs text-amber-700 mb-2">Simulated email delivery. Click the link below to verify your email:</p>
                                <a href={successData.dev_verify_link} className="text-xs text-primary-600 font-medium break-all hover:underline">
                                    {successData.dev_verify_link}
                                </a>
                            </div>
                        )}

                        <button
                            onClick={() => navigate('/signin')}
                            className="w-full py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-secondary-700 transition-all shadow-lg"
                        >
                            Return to Sign In
                        </button>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-md"
            >
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="inline-block mb-1"
                        >
                            <img
                                src="/carenest-logo.png"
                                alt="Care Nest Logo"
                                className="h-96 w-auto mx-auto mix-blend-multiply"
                            />
                        </motion.div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Join Care Nest</h1>
                        <p className="text-gray-600">Create your safe space for mental wellness</p>
                    </div>

                    {/* Error message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 bg-danger-light border border-danger-base rounded-xl flex items-start gap-3"
                        >
                            <AlertCircle className="w-5 h-5 text-danger-dark flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-danger-dark">{error}</p>
                        </motion.div>
                    )}

                    {/* Registration form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name field */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                    placeholder="Your name"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Email field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                    placeholder="you@example.com"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Password field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                    placeholder="Create a strong password"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            {/* Password strength indicator */}
                            {formData.password && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-2"
                                >
                                    <div className="flex gap-1 h-1.5 mb-1">
                                        {[1, 2, 3].map((level) => (
                                            <div
                                                key={level}
                                                className={`flex-1 rounded-full transition-colors ${level <= passwordStrength.level ? passwordStrength.color : 'bg-gray-200'
                                                    }`}
                                            ></div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-600">
                                        Password strength: <span className="font-medium">{passwordStrength.label}</span>
                                    </p>
                                </motion.div>
                            )}
                        </div>

                        {/* Confirm password field */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className={`w-full pl-11 pr-12 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:border-transparent transition-all outline-none ${formData.confirmPassword && !passwordsMatch
                                        ? 'border-danger-base focus:ring-danger-light'
                                        : 'border-gray-200 focus:ring-primary-500'
                                        }`}
                                    placeholder="Confirm your password"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            {/* Password match indicator */}
                            {formData.confirmPassword && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-2 flex items-center gap-2"
                                >
                                    {passwordsMatch ? (
                                        <>
                                            <CheckCircle2 className="w-4 h-4 text-success-base" />
                                            <p className="text-xs text-success-dark">Passwords match</p>
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="w-4 h-4 text-danger-base" />
                                            <p className="text-xs text-danger-dark">Passwords do not match</p>
                                        </>
                                    )}
                                </motion.div>
                            )}
                        </div>

                        {/* Terms checkbox */}
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                            <input
                                id="terms"
                                type="checkbox"
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-0.5"
                            />
                            <label htmlFor="terms" className="text-xs text-gray-600 leading-relaxed">
                                I agree to the{' '}
                                <button type="button" className="text-primary-600 hover:text-primary-700 font-medium">
                                    Terms of Service
                                </button>{' '}
                                and{' '}
                                <button type="button" className="text-primary-600 hover:text-primary-700 font-medium">
                                    Privacy Policy
                                </button>
                            </label>
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={loading || !agreedToTerms}
                            className="w-full py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-secondary-700 focus:ring-4 focus:ring-primary-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Creating account...
                                </span>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    {/* Sign in link */}
                    <p className="mt-6 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link
                            to="/signin"
                            className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                        >
                            Sign in
                        </Link>
                    </p>

                    {/* Privacy assurance */}
                    <div className="mt-6 p-4 bg-primary-50 rounded-xl border border-primary-100">
                        <p className="text-xs text-primary-800 text-center leading-relaxed">
                            🛡️ Your data is protected with industry-standard encryption.
                            We will never sell or share your personal information with third parties.
                        </p>
                    </div>
                </div>
                </motion.div>
            )}
        </div>
    );
}

export default SignUp;
