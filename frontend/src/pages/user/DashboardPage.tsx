import { LayoutDashboard, FileCheck, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function UserDashboard() {
    const { user } = useAuthStore();

    const stats = [
        { label: 'Submitted', value: 12, icon: FileCheck, color: 'text-primary-400' },
        { label: 'Pending', value: 3, icon: Clock, color: 'text-amber-400' },
        { label: 'Approved', value: 8, icon: FileCheck, color: 'text-emerald-400' },
        { label: 'Rejected', value: 1, icon: AlertCircle, color: 'text-red-400' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-100 dark:text-slate-100">
                    Welcome back, {user?.name || 'User'}
                </h1>
                <p className="text-slate-400 mt-1">Here's an overview of your submissions</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-primary-500/30 transition-colors"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">{stat.label}</p>
                                <p className="text-3xl font-bold mt-1 text-slate-100">{stat.value}</p>
                            </div>
                            <stat.icon className={`w-10 h-10 ${stat.color} opacity-60`} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4 text-slate-100">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        to="/map"
                        className="flex items-center gap-3 p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                    >
                        <LayoutDashboard className="w-5 h-5 text-primary-400" />
                        <span className="text-slate-200">View Public Map</span>
                    </Link>
                    <Link
                        to="/user/my-reviews"
                        className="flex items-center gap-3 p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                    >
                        <FileCheck className="w-5 h-5 text-emerald-400" />
                        <span className="text-slate-200">My Reviews</span>
                    </Link>
                    <Link
                        to="/user/notifications"
                        className="flex items-center gap-3 p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                    >
                        <Clock className="w-5 h-5 text-amber-400" />
                        <span className="text-slate-200">Notifications</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
