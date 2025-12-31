import { useState, useEffect } from 'react';
import { Search, Shield, Trash2, Edit2, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetch('/api/admin/users')
            .then(res => res.json())
            .then(data => {
                if (data.users) {
                    setUsers(data.users);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch users", err);
                setLoading(false);
            });
    }, []);

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="p-6 flex justify-center"><Loader2 className="animate-spin text-slate-500" /></div>;
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">User Management</h1>
                    <p className="text-slate-400 text-sm">Manage access and roles for the platform.</p>
                </div>
                <Button>Invite User</Button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary-500"
                    />
                </div>
                <div className="text-xs text-slate-500 self-center">
                    Showing {filteredUsers.length} users
                </div>
            </div>

            {/* Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <div className="max-h-[calc(100vh-16rem)] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-950 text-slate-400 font-medium border-b border-slate-800 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary-900/50 text-primary-400 flex items-center justify-center font-bold">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-white">{user.name}</div>
                                                <div className="text-slate-500 text-xs">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.role === 'admin'
                                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                            }`}>
                                            {user.role === 'admin' && <Shield className="w-3 h-3" />}
                                            <span className="capitalize">{user.role}</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded text-xs text-emerald-400 bg-emerald-500/10">
                                            Active
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
