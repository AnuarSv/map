import { Bell, Search } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useLocation } from 'react-router-dom';

interface TopBarProps {
    sidebarCollapsed: boolean;
}

export function TopBar({ sidebarCollapsed }: TopBarProps) {
    const { user } = useAuthStore();
    const location = useLocation();

    // Generate breadcrumbs from path
    const pathSegments = location.pathname.split('/').filter(Boolean);

    return (
        <header className={`
      fixed top-0 right-0 h-16 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800
      flex items-center justify-between px-6 transition-all duration-300
      ${sidebarCollapsed ? 'left-20' : 'left-64'}
    `}>
            {/* Left: Breadcrumbs */}
            <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">Home</span>
                {pathSegments.map((segment, index) => (
                    <div key={segment} className="flex items-center">
                        <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
                        <span className={`capitalize ${index === pathSegments.length - 1 ? 'text-slate-900 dark:text-white font-medium' : 'hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors'}`}>
                            {segment.replace(/-/g, ' ')}
                        </span>
                    </div>
                ))}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative hidden md:block group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-primary-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm rounded-full py-1.5 pl-10 pr-4 w-64 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    />
                </div>

                {/* Notifications */}
                <button className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                </button>

                <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>

                {/* User Profile */}
                <div className="flex items-center gap-3 pl-1">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-slate-900 dark:text-white leading-none">{user?.name}</p>
                        <p className="text-xs text-slate-500 mt-1 capitalize">{user?.role}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-500 to-primary-700 flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-lg">
                        <span className="text-xs font-bold text-white tracking-wider">
                            {user?.name?.substring(0, 2).toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
}
