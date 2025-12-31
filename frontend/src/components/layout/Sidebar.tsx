import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Map as MapIcon,
    Users,
    FileText,
    Settings,
    LogOut,
    Database,
    ShieldAlert,
    Menu,
    Bell
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
    const location = useLocation();
    const { user, logout } = useAuthStore();
    const isAdmin = user?.role === 'admin';
    const isExpert = user?.role === 'expert' || isAdmin;

    const isActive = (path: string) => location.pathname.startsWith(path);

    const navItemClass = (active: boolean) => `
    flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
    ${active
            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800'}
  `;

    return (
        <aside className={`
      fixed left-0 top-0 h-screen bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700/50 
      transition-all duration-300 z-50 flex flex-col
      ${collapsed ? 'w-20' : 'w-64'}
    `}>
            {/* Header */}
            <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-700/50">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center flex-shrink-0">
                        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <span className={`font-bold text-lg tracking-tight whitespace-nowrap transition-opacity duration-200 text-slate-900 dark:text-white ${collapsed ? 'opacity-0' : 'opacity-100'}`}>
                        WaterMap <span className="text-primary-500">Pro</span>
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <div className="mb-2 px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {!collapsed && 'Main'}
                </div>

                {/* User Dashboard (visible to all logged-in users) */}
                <Link to="/user/dashboard" className={navItemClass(isActive('/user/dashboard'))}>
                    <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span>Dashboard</span>}
                </Link>

                {/* Expert: Map Editor */}
                {isExpert && (
                    <>
                        <Link to="/expert/map-editor" className={navItemClass(isActive('/expert/map-editor'))}>
                            <MapIcon className="w-5 h-5 flex-shrink-0" />
                            {!collapsed && <span>Map Editor</span>}
                        </Link>
                        <Link to="/expert/my-submissions" className={navItemClass(isActive('/expert/my-submissions'))}>
                            <FileText className="w-5 h-5 flex-shrink-0" />
                            {!collapsed && <span>My Submissions</span>}
                        </Link>
                    </>
                )}

                {/* My Reviews & Notifications (all users) */}
                <Link to="/user/my-reviews" className={navItemClass(isActive('/user/my-reviews'))}>
                    <FileText className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span>My Reviews</span>}
                </Link>

                <Link to="/user/notifications" className={navItemClass(isActive('/user/notifications'))}>
                    <Bell className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span>Notifications</span>}
                </Link>

                {/* Public Map */}
                <Link to="/map" className={navItemClass(isActive('/map') && !location.pathname.startsWith('/expert'))}>
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        <path d="M2 12h20" />
                    </svg>
                    {!collapsed && <span>Public Map</span>}
                </Link>

                {isAdmin && (
                    <>
                        <div className="mt-8 mb-2 px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            {!collapsed && 'Administration'}
                        </div>

                        <Link to="/admin/users" className={navItemClass(isActive('/admin/users'))}>
                            <Users className="w-5 h-5 flex-shrink-0" />
                            {!collapsed && <span>Users</span>}
                        </Link>

                        <Link to="/admin/reviews" className={navItemClass(isActive('/admin/reviews'))}>
                            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                            {!collapsed && <span>Reviews</span>}
                        </Link>

                        <Link to="/admin/api" className={navItemClass(isActive('/admin/api'))}>
                            <Database className="w-5 h-5 flex-shrink-0" />
                            {!collapsed && <span>API Management</span>}
                        </Link>
                    </>
                )}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700/50">
                <Link to="/user/settings" className={navItemClass(isActive('/user/settings'))}>
                    <Settings className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span>Settings</span>}
                </Link>

                <div className="my-1">
                    <ThemeSwitcher />
                </div>

                <button
                    onClick={logout}
                    className="w-full mt-1 flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors"
                >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span>Logout</span>}
                </button>

                <button
                    onClick={onToggle}
                    className="mt-4 w-full flex justify-center p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                    <Menu className="w-5 h-5" />
                </button>
            </div>
        </aside>
    );
}
