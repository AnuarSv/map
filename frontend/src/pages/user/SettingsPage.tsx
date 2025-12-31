import { useState } from 'react';
import { User, Lock, Key, Save, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function SettingsPage() {
    const { user } = useAuthStore();
    const [showApiKey, setShowApiKey] = useState(false);
    const [copied, setCopied] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');

    const mockApiKey = 'wm_sk_live_1234567890abcdef';

    const copyApiKey = () => {
        navigator.clipboard.writeText(mockApiKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-2xl font-bold text-slate-100">Settings</h1>
                <p className="text-slate-400 mt-1">Manage your account and preferences</p>
            </div>

            {/* Profile Section */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <User className="w-5 h-5 text-primary-400" />
                    <h2 className="text-lg font-semibold text-slate-100">Profile Information</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1.5">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-primary-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1.5">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-primary-500"
                        />
                    </div>
                    <button className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-4 py-2.5 rounded-lg transition-colors">
                        <Save className="w-4 h-4" />
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Password Section */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Lock className="w-5 h-5 text-amber-400" />
                    <h2 className="text-lg font-semibold text-slate-100">Change Password</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1.5">Current Password</label>
                        <input
                            type="password"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-primary-500"
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1.5">New Password</label>
                        <input
                            type="password"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-primary-500"
                            placeholder="••••••••"
                        />
                    </div>
                    <button className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5 rounded-lg transition-colors">
                        <Lock className="w-4 h-4" />
                        Update Password
                    </button>
                </div>
            </div>

            {/* API Key Section */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Key className="w-5 h-5 text-emerald-400" />
                    <h2 className="text-lg font-semibold text-slate-100">API Key</h2>
                </div>

                <p className="text-slate-400 text-sm mb-4">
                    Use this key to access the WaterMap API programmatically.
                </p>

                <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 font-mono text-sm text-slate-300 flex items-center justify-between">
                        <span>{showApiKey ? mockApiKey : '••••••••••••••••••••'}</span>
                        <button
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="text-slate-500 hover:text-slate-300"
                        >
                            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    <button
                        onClick={copyApiKey}
                        className={`px-3 py-2.5 rounded-lg transition-colors ${copied
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
