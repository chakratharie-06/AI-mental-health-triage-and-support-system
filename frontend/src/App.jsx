import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import LandingPage from './pages/LandingPage';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
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

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/signin" replace />;
};

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/age-gate" element={<AgeGate />} />
                <Route path="/age-selection" element={<AgeSelection />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />

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
