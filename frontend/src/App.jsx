import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useEffect, lazy, Suspense } from 'react';

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

// Pages — lazy loaded for code splitting (each page = its own JS chunk)
const LandingPage     = lazy(() => import('./pages/LandingPage'));
const SignIn          = lazy(() => import('./pages/SignIn'));
const SignUp          = lazy(() => import('./pages/SignUp'));
const ForgotPassword  = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword   = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail     = lazy(() => import('./pages/VerifyEmail'));
const AgeGate         = lazy(() => import('./pages/AgeGate'));
const AgeSelection    = lazy(() => import('./pages/AgeSelection'));
const DashboardPage   = lazy(() => import('./pages/DashboardPage'));
const ChatPage        = lazy(() => import('./pages/ChatPage'));
const MoodTrackingPage = lazy(() => import('./pages/MoodTrackingPage'));
const JournalPage     = lazy(() => import('./pages/JournalPage'));
const RelaxPage       = lazy(() => import('./pages/RelaxPage'));
const ProfilePage     = lazy(() => import('./pages/ProfilePage'));
const AssessmentPage  = lazy(() => import('./pages/AssessmentPage'));
const AnalyticsPage   = lazy(() => import('./pages/AnalyticsPage'));
const AdminDashboard  = lazy(() => import('./pages/AdminDashboard'));
const ResourcesPage   = lazy(() => import('./pages/ResourcesPage'));
import TimeTracker from './components/TimeTracker';

// Loading fallback shown between route transitions
const PageLoader = () => (
    <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: 'var(--bg-primary, #0f172a)'
    }}>
        <div style={{
            width: 40, height: 40, border: '3px solid rgba(99,102,241,0.3)',
            borderTopColor: '#6366f1', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
);

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
            <Suspense fallback={<PageLoader />}>
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
            </Suspense>
        </Router>
    );
}

export default App;
