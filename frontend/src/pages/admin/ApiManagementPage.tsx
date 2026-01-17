import { useState } from 'react';
import { Key, Copy, Trash2, Plus, Activity, Eye, EyeOff, Check, RefreshCw, BarChart3, Clock, Shield } from 'lucide-react';

interface ApiKey {
    id: number;
    name: string;
    key: string;
    createdAt: string;
    lastUsed: string;
    requests: number;
    status: 'active' | 'revoked';
}

const mockKeys: ApiKey[] = [
    { id: 1, name: 'Production App', key: 'wm_live_a1b2c3d4e5f6g7h8i9j0', createdAt: '2024-01-01', lastUsed: '2024-01-17', requests: 15420, status: 'active' },
    { id: 2, name: 'Development', key: 'wm_dev_x9y8z7w6v5u4t3s2r1q0', createdAt: '2024-01-10', lastUsed: '2024-01-16', requests: 3210, status: 'active' },
    { id: 3, name: 'Old Integration', key: 'wm_old_m1n2o3p4q5r6s7t8u9v0', createdAt: '2023-12-01', lastUsed: '2024-01-05', requests: 890, status: 'revoked' },
];

const usageData = [
    { day: 'Mon', requests: 2450 },
    { day: 'Tue', requests: 3200 },
    { day: 'Wed', requests: 2890 },
    { day: 'Thu', requests: 3100 },
    { day: 'Fri', requests: 2780 },
    { day: 'Sat', requests: 1200 },
    { day: 'Sun', requests: 980 },
];

export default function ApiManagementPage() {
    const [keys] = useState(mockKeys);
    const [showKey, setShowKey] = useState<Record<number, boolean>>({});
    const [copied, setCopied] = useState<number | null>(null);

    const copyKey = (id: number, key: string) => {
        navigator.clipboard.writeText(key);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const toggleKeyVisibility = (id: number) => {
        setShowKey(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const maxRequests = Math.max(...usageData.map(d => d.requests));

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">API Management</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage API keys and monitor usage</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium shadow-lg shadow-primary-500/25 transition-all hover:scale-105">
                    <Plus className="w-5 h-5" />
                    Generate New Key
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total Requests', value: '19.5K', icon: Activity, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-900/20' },
                    { label: 'Active Keys', value: keys.filter(k => k.status === 'active').length, icon: Key, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                    { label: 'Avg Response', value: '45ms', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                    { label: 'Rate Limit', value: '1000/min', icon: Shield, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 ${stat.bg} rounded-xl`}>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Usage Chart */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <BarChart3 className="w-5 h-5 text-primary-500" />
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Weekly Usage</h2>
                    </div>
                    <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary-500 transition-colors">
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>
                <div className="flex items-end justify-between gap-2 h-40">
                    {usageData.map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                            <div
                                className="w-full bg-primary-500/20 rounded-t-lg relative group cursor-pointer hover:bg-primary-500/30 transition-colors"
                                style={{ height: `${(d.requests / maxRequests) * 100}%` }}
                            >
                                <div
                                    className="absolute bottom-0 left-0 right-0 bg-primary-500 rounded-t-lg transition-all"
                                    style={{ height: '100%' }}
                                />
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {d.requests.toLocaleString()}
                                </div>
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400">{d.day}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* API Keys List */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-5 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <Key className="w-5 h-5 text-primary-500" />
                        API Keys
                    </h2>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {keys.map(k => (
                        <div key={k.id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-semibold text-slate-900 dark:text-white">{k.name}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${k.status === 'active'
                                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                                            : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                            {k.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-2">
                                        <code className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-mono text-slate-600 dark:text-slate-300">
                                            {showKey[k.id] ? k.key : k.key.slice(0, 10) + '••••••••••••'}
                                        </code>
                                        <button
                                            onClick={() => toggleKeyVisibility(k.id)}
                                            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                        >
                                            {showKey[k.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => copyKey(k.id, k.key)}
                                            className="p-1.5 text-slate-400 hover:text-primary-500 transition-colors"
                                        >
                                            {copied === k.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                                        Created {k.createdAt} • Last used {k.lastUsed} • {k.requests.toLocaleString()} requests
                                    </p>
                                </div>
                                {k.status === 'active' && (
                                    <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
