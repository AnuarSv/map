import { useState } from 'react';
import { User, Lock, Save } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function SettingsPage() {
    const { user } = useAuthStore();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Настройки</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Управление аккаунтом и предпочтениями</p>
            </div>

            {/* Profile Section */}
            <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <User className="w-5 h-5 text-emerald-500" />
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Профиль</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Имя</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                        />
                    </div>
                    <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg transition-colors font-medium">
                        <Save className="w-4 h-4" />
                        Сохранить
                    </button>
                </div>
            </div>

            {/* Password Section */}
            <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Lock className="w-5 h-5 text-amber-500" />
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Изменить пароль</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Текущий пароль</label>
                        <input
                            type="password"
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Новый пароль</label>
                        <input
                            type="password"
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                            placeholder="••••••••"
                        />
                    </div>
                    <button className="flex items-center gap-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white px-4 py-2.5 rounded-lg transition-colors font-medium">
                        <Lock className="w-4 h-4" />
                        Обновить пароль
                    </button>
                </div>
            </div>
        </div>
    );
}
