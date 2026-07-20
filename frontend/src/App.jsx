import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useEffect } from 'react';

// Theme Manager - Mounts CSS classes heavily changing UI based on Age
const ThemeManager = () => {
    const { user } = useAuth();
    
    useEffect(() => {
        // Clear all themes
        document.body.classList.remove('theme-student', 'theme-professional', 'theme-senior', 'theme-default');
        
        const ageGroup = user?.age_group;
        if (ageGroup === '18-25') {
            document.body.classList.add('theme-student');
        } else if (ageGroup === '25-35' || ageGroup === '35-45') {
            document.body.classList.add('theme-professional');
        } else if (ageGroup === '45+') {
            document.body.classList.add('theme-senior');
        } else {
            document.body.classList.add('theme-default');
        }
    }, [user?.age_group]);

    return null;
};

// Pages
import LandingPage from './pages/LandingPage';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import AgeGate from './pages/AgeGate';
import AgeSelection from './pages/AgeSelection';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import MoodTrackingPage from './pages/MoodTrackingPage';
import JournalPage from './pages/JournalPage';
import RelaxPage from './pages/RelaxPage';
import ProfilePage from './pages/ProfilePage';
import AssessmentPage from './pages/AssessmentPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AdminDashboard from './pages/AdminDashboard';
import ResourcesPage from './pages/ResourcesPage';
import TimeTracker from './components/TimeTracker';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/signin" replace />;
};

// Age Selection Guard — if user already has age_group, send them to dashboard
const AgeSelectionGuard = ({ children }) => {
    const { user } = useAuth();
    if (user?.age_group) return <Navigate to="/dashboard" replace />;
    return children;
};

function App() {
    return (
        <Router>
            <ThemeManager />
            <TimeTracker />
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/age-gate" element={<AgeGate />} />
                <Route 
                    path="/age-selection" 
                    element={
                        <AgeSelectionGuard>
                            <AgeSelection />
                        </AgeSelectionGuard>
                    } 
                />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Protected Routes */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/chat"
                    element={
                        <ProtectedRoute>
                            <ChatPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/mood"
                    element={
                        <ProtectedRoute>
                            <MoodTrackingPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/journal"
                    element={
                        <ProtectedRoute>
                            <JournalPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/relax"
                    element={
                        <ProtectedRoute>
                            <RelaxPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <ProfilePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/assessment"
                    element={
                        <ProtectedRoute>
                            <AssessmentPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/analytics"
                    element={
                        <ProtectedRoute>
                            <AnalyticsPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/resources"
                    element={
                        <ProtectedRoute>
                            <ResourcesPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
