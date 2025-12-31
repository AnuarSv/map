import { useState } from 'react';
import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface DashboardLayoutProps {
    children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans transition-colors">
            <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

            <TopBar sidebarCollapsed={collapsed} />

            <main className={`
        pt-20 px-6 pb-6 min-h-screen transition-all duration-300
        ${collapsed ? 'pl-26' : 'pl-70'}
      `}>
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
