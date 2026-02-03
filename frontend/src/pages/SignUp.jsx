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

    // Password strength calculation
    const getPasswordStrength = (pwd) => {
        if (!pwd) return { level: 0, label: '', color: '' };
        if (pwd.length < 6) return { level: 1, label: 'Weak', color: 'bg-red-500' };
        if (pwd.length < 10) return { level: 2, label: 'Fair', color: 'bg-yellow-500' };
        return { level: 3, label: 'Strong', color: 'bg-green-500' };
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
            await register(formData.name, formData.email, formData.password);
            navigate('/age-selection');
        } catch (err) {
            setError(err.response?.data?.error || 'Unable to create account. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 right-20 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute top-1/3 left-10 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            {/* Main card */}
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
                            className="inline-block mb-4"
                        >
                            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
                                <Heart className="w-8 h-8 text-white" />
                            </div>
                        </motion.div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Join Care Nest</h1>
                        <p className="text-gray-600">Create your safe space for mental wellness</p>
                    </div>

                    {/* Error message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
                        >
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">{error}</p>
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
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none"
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
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none"
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
                                    className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none"
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
                                        ? 'border-red-300 focus:ring-red-200'
                                        : 'border-gray-200 focus:ring-pink-500'
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
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            <p className="text-xs text-green-600">Passwords match</p>
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="w-4 h-4 text-red-500" />
                                            <p className="text-xs text-red-600">Passwords do not match</p>
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
                                className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500 mt-0.5"
                            />
                            <label htmlFor="terms" className="text-xs text-gray-600 leading-relaxed">
                                I agree to the{' '}
                                <button type="button" className="text-pink-600 hover:text-pink-700 font-medium">
                                    Terms of Service
                                </button>{' '}
                                and{' '}
                                <button type="button" className="text-pink-600 hover:text-pink-700 font-medium">
                                    Privacy Policy
                                </button>
                            </label>
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={loading || !agreedToTerms}
                            className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-xl hover:from-pink-700 hover:to-purple-700 focus:ring-4 focus:ring-pink-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
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
                            className="text-pink-600 hover:text-pink-700 font-semibold transition-colors"
                        >
                            Sign in
                        </Link>
                    </p>

                    {/* Privacy assurance */}
                    <div className="mt-6 p-4 bg-pink-50 rounded-xl border border-pink-100">
                        <p className="text-xs text-pink-800 text-center leading-relaxed">
                            🛡️ Your data is protected with industry-standard encryption.
                            We will never sell or share your personal information with third parties.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default SignUp;
