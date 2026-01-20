import { Link, useLocation } from 'react-router-dom';
import {
    Map as MapIcon,
    Users,
    Settings,
    LogOut,
    Menu,
    GraduationCap,
    Edit3
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

    const isActive = (path: string) => location.pathname.startsWith(path);

    const navItemClass = (active: boolean) => `
    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group font-medium
    ${active
            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}
  `;

    return (
        <aside className={`
      fixed left-0 top-0 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 
      transition-all duration-300 z-50 flex flex-col
      ${collapsed ? 'w-20' : 'w-64'}
    `}>
            {/* Header */}
            <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800 bg-emerald-600">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                        <MapIcon className="w-5 h-5 text-white" />
                    </div>
                    <span className={`font-bold text-xl tracking-tight whitespace-nowrap transition-opacity duration-200 text-white ${collapsed ? 'opacity-0' : 'opacity-100'}`}>
                        Geo<span className="text-emerald-200">KZ</span>
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <div className="mb-2 px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {!collapsed && 'Главное'}
                </div>

                <Link to="/quiz" className={navItemClass(isActive('/quiz') && !location.pathname.includes('/contour'))}>
                    <GraduationCap className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span>Обучение</span>}
                </Link>

                <Link to="/map" className={navItemClass(isActive('/map'))}>
                    <MapIcon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span>Интерактивная карта</span>}
                </Link>

                <Link to="/quiz/contour" className={navItemClass(isActive('/quiz/contour'))}>
                    <Edit3 className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span>Контурная карта</span>}
                </Link>

                {(user?.role === 'expert' || isAdmin) && (
                    <>
                        <div className="mt-4 mb-2 px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            {!collapsed && 'Инструменты'}
                        </div>

                        <Link to="/expert/map-editor" className={navItemClass(isActive('/expert/map-editor'))}>
                            <Edit3 className="w-5 h-5 flex-shrink-0" />
                            {!collapsed && <span>Редактор карты</span>}
                        </Link>

                        <Link to="/teacher/builder" className={navItemClass(isActive('/teacher/builder'))}>
                            <GraduationCap className="w-5 h-5 flex-shrink-0" />
                            {!collapsed && <span>Конструктор</span>}
                        </Link>
                    </>
                )}

                {isAdmin && (
                    <>
                        <div className="mt-4 mb-2 px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            {!collapsed && 'Администрирование'}
                        </div>

                        <Link to="/admin/users" className={navItemClass(isActive('/admin/users'))}>
                            <Users className="w-5 h-5 flex-shrink-0" />
                            {!collapsed && <span>Пользователи</span>}
                        </Link>
                    </>
                )}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700/50">
                <Link to="/user/settings" className={navItemClass(isActive('/user/settings'))}>
                    <Settings className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span>Настройки</span>}
                </Link>

                <div className="my-1">
                    <ThemeSwitcher />
                </div>

                <button
                    onClick={logout}
                    className="w-full mt-1 flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors"
                >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span>Выйти</span>}
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
