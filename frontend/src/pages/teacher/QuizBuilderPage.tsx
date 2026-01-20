import { useState } from 'react';
import {
    Share2,
    GraduationCap,
    School,
    CheckCircle2,
    Globe,
    Settings,
    Copy,
    ExternalLink
} from 'lucide-react';

export default function QuizBuilderPage() {
    const [title, setTitle] = useState('');
    const [audience, setAudience] = useState<'school' | 'university'>('school');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [shareCode, setShareCode] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const categories = [
        { id: 'regions', name: 'Области и регионы', color: 'text-purple-500' },
        { id: 'cities', name: 'Крупные города', color: 'text-emerald-500' },
        { id: 'rivers', name: 'Реки и каналы', color: 'text-blue-500' },
        { id: 'lakes', name: 'Озера и водохранилища', color: 'text-cyan-500' },
        { id: 'minerals', name: 'Полезные ископаемые', color: 'text-amber-500' },
    ];

    const toggleCategory = (id: string) => {
        setSelectedCategories(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const handleCreate = async () => {
        setIsCreating(true);
        // Backend simulation
        await new Promise(r => setTimeout(r, 1500));
        setShareCode(Math.random().toString(36).substring(7).toUpperCase());
        setIsCreating(false);
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-6">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Конструктор тестов</h1>
                    <p className="text-slate-500 dark:text-slate-400">Создавайте уникальные проверочные работы для ваших учеников</p>
                </div>
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center">
                    <GraduationCap className="w-8 h-8 text-emerald-600" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Название теста</label>
                        <input
                            type="text"
                            placeholder="Напр: Физическая география Восточного Казахстана"
                            className="w-full px-5 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-lg font-bold focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </section>

                    {/* Category Selection */}
                    <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Темы для проверки</label>
                        <div className="space-y-3">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => toggleCategory(cat.id)}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${selectedCategories.includes(cat.id) ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-50 dark:border-slate-800 hover:border-slate-200 opacity-70'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm ${cat.color}`}>
                                            <Settings className="w-5 h-5" />
                                        </div>
                                        <span className={`font-bold ${selectedCategories.includes(cat.id) ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                                            {cat.name}
                                        </span>
                                    </div>
                                    {selectedCategories.includes(cat.id) && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                                </button>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="space-y-6">
                    {/* Audience Selection */}
                    <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Целевая аудитория</label>
                        <div className="space-y-2">
                            <button
                                onClick={() => setAudience('school')}
                                className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${audience === 'school' ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700' : 'border-slate-50 dark:border-slate-800 text-slate-500'}`}
                            >
                                <School className="w-5 h-5" />
                                <span className="font-bold">Школьники</span>
                            </button>
                            <button
                                onClick={() => setAudience('university')}
                                className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${audience === 'university' ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700' : 'border-slate-50 dark:border-slate-800 text-slate-500'}`}
                            >
                                <GraduationCap className="w-5 h-5" />
                                <span className="font-bold">Студенты</span>
                            </button>
                        </div>
                    </section>

                    {/* Action */}
                    {!shareCode ? (
                        <button
                            disabled={!title || selectedCategories.length === 0 || isCreating}
                            onClick={handleCreate}
                            className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-extrabold rounded-3xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3"
                        >
                            {isCreating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Globe className="w-6 h-6" />}
                            Сгенерировать ссылку
                        </button>
                    ) : (
                        <div className="bg-emerald-600 p-6 rounded-3xl text-white shadow-xl animate-in zoom-in duration-300">
                            <div className="flex items-center gap-2 mb-4">
                                <Share2 className="w-5 h-5" />
                                <span className="font-bold">Тест готов!</span>
                            </div>
                            <div className="bg-white/20 p-4 rounded-2xl flex items-center justify-between mb-4">
                                <code className="font-mono font-black text-xl">{shareCode}</code>
                                <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                                    <Copy className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-[10px] opacity-80 mb-4 leading-relaxed">Отправьте этот код или прямую ссылку ученикам для прохождения теста.</p>
                            <button className="w-full py-3 bg-white text-emerald-600 font-bold rounded-xl text-sm flex items-center justify-center gap-2">
                                <ExternalLink className="w-4 h-4" /> Посмотреть статистику
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function Loader2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    )
}
