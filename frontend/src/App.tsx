import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Pages
import LoginPage from './pages/login';
import PublicMapPage from './pages/map';
import EditorPage from './pages/expert/EditorPage';
import SubmissionsPage from './pages/expert/SubmissionsPage';
import UsersPage from './pages/admin/UsersPage';
import ReviewPage from './pages/admin/ReviewPage';
import ApiManagementPage from './pages/admin/ApiManagementPage';

// Quiz Pages
import QuizHomePage from './pages/quiz/QuizHomePage';
import QuizPlayerPage from './pages/quiz/QuizPlayerPage';
import MineralQuizPage from './pages/quiz/MineralQuizPage';
import MineralBatchQuizPage from './pages/quiz/MineralBatchQuizPage';
import ContourMapPage from './pages/quiz/ContourMapPage';

// User Pages
import UserDashboard from './pages/user/DashboardPage';
import MyReviewsPage from './pages/user/MyReviewsPage';
import NotificationsPage from './pages/user/NotificationsPage';
import SettingsPage from './pages/user/SettingsPage';
import WaterDirectoryPage from './pages/user/WaterDirectoryPage';

// Teacher Pages
import QuizBuilderPage from './pages/teacher/QuizBuilderPage';
import QuizResultsPage from './pages/teacher/QuizResultsPage';

// Simple RBAC Wrapper
const ProtectedRoute = ({ children, roles = [] }: { children: React.ReactNode, roles?: string[] }) => {
    const { user, isAuthenticated } = useAuthStore();

    if (!isAuthenticated) return <Navigate to="/login" />;
    if (roles.length > 0 && user && !roles.includes(user.role)) return <Navigate to="/user/dashboard" />;

    return <DashboardLayout>{children}</DashboardLayout>;
};

// Layout-less Route
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
};

export default function App() {
    const { checkAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    return (
        <BrowserRouter>
            <Routes>
                {/* Public */}
                <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

                {/* Quiz Routes */}
                <Route path="/quiz" element={<ProtectedRoute><QuizHomePage /></ProtectedRoute>} />
                <Route path="/quiz/minerals" element={<ProtectedRoute><MineralQuizPage /></ProtectedRoute>} />
                <Route path="/quiz/minerals-batch" element={<ProtectedRoute><MineralBatchQuizPage /></ProtectedRoute>} />
                <Route path="/quiz/category/:category" element={<ProtectedRoute><QuizPlayerPage /></ProtectedRoute>} />
                <Route path="/quiz/play/:quizId" element={<ProtectedRoute><QuizPlayerPage /></ProtectedRoute>} />
                <Route path="/quiz/contour" element={<ProtectedRoute><ContourMapPage /></ProtectedRoute>} />

                {/* Public Map */}
                <Route path="/map" element={<ProtectedRoute><PublicMapPage /></ProtectedRoute>} />

                {/* User Routes */}
                <Route path="/user/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
                <Route path="/user/my-reviews" element={<ProtectedRoute><MyReviewsPage /></ProtectedRoute>} />
                <Route path="/user/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                <Route path="/user/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                <Route path="/water-directory" element={<ProtectedRoute><WaterDirectoryPage /></ProtectedRoute>} />

                {/* Expert Routes */}
                <Route path="/expert/map-editor" element={<ProtectedRoute roles={['expert', 'admin']}><EditorPage /></ProtectedRoute>} />
                <Route path="/expert/my-submissions" element={<ProtectedRoute roles={['expert', 'admin']}><SubmissionsPage /></ProtectedRoute>} />

                {/* Teacher Routes */}
                <Route path="/teacher/builder" element={<ProtectedRoute roles={['expert', 'admin']}><QuizBuilderPage /></ProtectedRoute>} />
                <Route path="/teacher/stats" element={<ProtectedRoute roles={['expert', 'admin']}><QuizResultsPage /></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><UsersPage /></ProtectedRoute>} />
                <Route path="/admin/reviews" element={<ProtectedRoute roles={['admin']}><ReviewPage /></ProtectedRoute>} />
                <Route path="/admin/api" element={<ProtectedRoute roles={['admin']}><ApiManagementPage /></ProtectedRoute>} />

                {/* Shared Quiz (Publicly Accessible) */}
                <Route path="/quiz/shared/:shareCode" element={<PublicRoute><QuizPlayerPage /></PublicRoute>} />

                {/* Redirects */}
                <Route path="/" element={<Navigate to="/quiz" />} />
                <Route path="*" element={<Navigate to="/quiz" />} />
            </Routes>
        </BrowserRouter>
    );
}

