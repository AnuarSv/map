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

// User Pages
import UserDashboard from './pages/user/DashboardPage';
import MyReviewsPage from './pages/user/MyReviewsPage';
import NotificationsPage from './pages/user/NotificationsPage';
import SettingsPage from './pages/user/SettingsPage';
import WaterDirectoryPage from './pages/user/WaterDirectoryPage';

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

                {/* Admin Routes */}
                <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><UsersPage /></ProtectedRoute>} />
                <Route path="/admin/reviews" element={<ProtectedRoute roles={['admin']}><ReviewPage /></ProtectedRoute>} />
                <Route path="/admin/api" element={<ProtectedRoute roles={['admin']}><ApiManagementPage /></ProtectedRoute>} />

                {/* Redirects */}
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="*" element={<Navigate to="/user/dashboard" />} />
            </Routes>
        </BrowserRouter>
    );
}

