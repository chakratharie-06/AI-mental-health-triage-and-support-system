import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Home, MessageCircle, Heart, BookOpen, Wind, User, BarChart3, LogOut, Sun, Moon, Phone } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { isDark, toggleTheme } = useTheme();

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('token');

            // Call backend logout endpoint to clear conversations
            await axios.post('http://localhost:5000/api/logout', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('✅ Logout successful - Chat cleared, analytics preserved');
        } catch (error) {
            console.error('Logout API error:', error);
            // Continue with logout even if API fails
        }

        // Clear authentication and chat data from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('chatMessages');
        localStorage.removeItem('currentConversationId');

        // Navigate to signin
        navigate('/signin');
    };

    const navLinks = [
        { path: '/dashboard', label: 'Dashboard', icon: Home },
        { path: '/chat', label: 'Chat', icon: MessageCircle },
        { path: '/mood', label: 'Mood', icon: Heart },
        { path: '/journal', label: 'Journal', icon: BookOpen },
        { path: '/relax', label: 'Relax', icon: Wind },
        { path: '/resources', label: 'Resources', icon: Phone },
        { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">


                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${isActive(link.path)
                                        ? 'bg-primary-100 text-primary-700 font-semibold'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="text-sm">{link.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* User Menu */}
                    <div className="hidden md:flex items-center gap-2">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        <Link
                            to="/profile"
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="Profile"
                        >
                            <User className="w-5 h-5" />
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-gray-600 hover:text-danger-base hover:bg-danger-light rounded-lg transition-colors"
                            aria-label="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                        aria-label="Toggle menu"
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isOpen && (
                    <div className="md:hidden py-4 border-t border-gray-200">
                        <div className="space-y-1">
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive(link.path)
                                            ? 'bg-primary-100 text-primary-700 font-semibold'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span>{link.label}</span>
                                    </Link>
                                );
                            })}
                            <Link
                                to="/profile"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            >
                                <User className="w-5 h-5" />
                                <span>Profile</span>
                            </Link>
                            {/* Theme Toggle */}
                            <button
                                onClick={() => {
                                    toggleTheme();
                                    setIsOpen(false);
                                }}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 w-full"
                            >
                                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                                <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                            </button>
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    handleLogout();
                                }}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-danger-light hover:text-danger-base w-full"
                            >
                                <LogOut className="w-5 h-5" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
