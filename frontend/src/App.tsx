import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Pages
import LoginPage from './pages/login';
import PublicMapPage from './pages/map';
import EditorPage from './pages/expert/EditorPage';
import UsersPage from './pages/admin/UsersPage';

// User Pages
import UserDashboard from './pages/user/DashboardPage';
import MyReviewsPage from './pages/user/MyReviewsPage';
import NotificationsPage from './pages/user/NotificationsPage';
import SettingsPage from './pages/user/SettingsPage';

// Simple RBAC Wrapper
const ProtectedRoute = ({ children, roles = [] }: { children: React.ReactNode, roles?: string[] }) => {
    const { user, isAuthenticated } = useAuthStore();

    if (!isAuthenticated) return <Navigate to="/login" />;
    if (roles.length > 0 && user && !roles.includes(user.role)) return <Navigate to="/unauthorized" />;

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

                {/* Public Map - with sidebar when logged in */}
                <Route
                    path="/map"
                    element={
                        <ProtectedRoute>
                            <div className="-m-6 h-[calc(100vh-4rem)]">
                                <PublicMapPage />
                            </div>
                        </ProtectedRoute>
                    }
                />

                {/* User Dashboard (all authenticated users) */}
                <Route
                    path="/user/dashboard"
                    element={
                        <ProtectedRoute>
                            <UserDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/user/my-reviews"
                    element={
                        <ProtectedRoute>
                            <MyReviewsPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/user/notifications"
                    element={
                        <ProtectedRoute>
                            <NotificationsPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/user/settings"
                    element={
                        <ProtectedRoute>
                            <SettingsPage />
                        </ProtectedRoute>
                    }
                />

                {/* Expert */}
                <Route
                    path="/expert/map-editor"
                    element={
                        <ProtectedRoute roles={['expert', 'admin']}>
                            <div className="-m-6 h-[calc(100vh-4rem)]"> {/* Full screen override */}
                                <EditorPage />
                            </div>
                        </ProtectedRoute>
                    }
                />

                {/* Admin */}
                <Route
                    path="/admin/users"
                    element={
                        <ProtectedRoute roles={['admin']}>
                            <UsersPage />
                        </ProtectedRoute>
                    }
                />

                {/* Redirects */}
                <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
}
