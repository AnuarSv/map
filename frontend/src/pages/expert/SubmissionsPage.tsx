import { useState } from 'react';
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, Eye, ChevronRight } from 'lucide-react';

interface Submission {
    id: number;
    objectName: string;
    objectType: string;
    action: 'create' | 'update' | 'delete';
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: string;
    reviewedAt?: string;
    reviewer?: string;
    comment?: string;
}

const mockSubmissions: Submission[] = [
    { id: 1, objectName: 'Иртыш', objectType: 'river', action: 'update', status: 'approved', submittedAt: '2024-01-15', reviewedAt: '2024-01-16', reviewer: 'Admin' },
    { id: 2, objectName: 'Балхаш', objectType: 'lake', action: 'update', status: 'pending', submittedAt: '2024-01-17' },
    { id: 3, objectName: 'Есіл', objectType: 'river', action: 'create', status: 'rejected', submittedAt: '2024-01-10', reviewedAt: '2024-01-11', reviewer: 'Admin', comment: 'Duplicate entry' },
    { id: 4, objectName: 'Тобыл', objectType: 'river', action: 'update', status: 'approved', submittedAt: '2024-01-08', reviewedAt: '2024-01-09', reviewer: 'Admin' },
    { id: 5, objectName: 'Сарыарқа', objectType: 'reservoir', action: 'create', status: 'pending', submittedAt: '2024-01-18' },
];

const statusConfig = {
    pending: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', label: 'Pending' },
    approved: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', label: 'Approved' },
    rejected: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', label: 'Rejected' }
};

const actionLabels = {
    create: { label: 'New Object', color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' },
    update: { label: 'Edit', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
    delete: { label: 'Delete', color: 'text-red-600 bg-red-100 dark:bg-red-900/30' }
};

export default function SubmissionsPage() {
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

    const filtered = filter === 'all' ? mockSubmissions : mockSubmissions.filter(s => s.status === filter);

    const stats = {
        total: mockSubmissions.length,
        pending: mockSubmissions.filter(s => s.status === 'pending').length,
        approved: mockSubmissions.filter(s => s.status === 'approved').length,
        rejected: mockSubmissions.filter(s => s.status === 'rejected').length
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">My Submissions</h1>
                <p className="text-slate-500 dark:text-slate-400">Track your water object changes and their review status</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total', value: stats.total, icon: FileText, color: 'text-slate-600' },
                    { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-500' },
                    { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'text-emerald-500' },
                    { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-red-500' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
                            </div>
                            <stat.icon className={`w-10 h-10 ${stat.color} opacity-50`} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
                {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f
                                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* Submissions List */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="p-12 text-center">
                        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-500 dark:text-slate-400">No submissions found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {filtered.map(sub => {
                            const status = statusConfig[sub.status];
                            const action = actionLabels[sub.action];
                            const StatusIcon = status.icon;

                            return (
                                <div key={sub.id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group cursor-pointer">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl ${status.bg}`}>
                                                <StatusIcon className={`w-5 h-5 ${status.color}`} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-slate-900 dark:text-white">{sub.objectName}</h3>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${action.color}`}>
                                                        {action.label}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                                    {sub.objectType} • Submitted {sub.submittedAt}
                                                    {sub.reviewer && ` • Reviewed by ${sub.reviewer}`}
                                                </p>
                                                {sub.comment && (
                                                    <p className="text-sm text-red-500 mt-1">"{sub.comment}"</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                                                {status.label}
                                            </span>
                                            <button className="p-2 rounded-lg text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 opacity-0 group-hover:opacity-100 transition-all">
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
