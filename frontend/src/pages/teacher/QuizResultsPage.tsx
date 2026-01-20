import {
    Users,
    BarChart3,
    ChevronLeft,
    Download,
    Trophy,
    Clock,
    UserCircle
} from 'lucide-react';

export default function QuizResultsPage() {
    const mockStats = [
        { id: 1, name: 'Арман Сериков', date: '20.01.2026', score: 18, total: 20, time: '12:45' },
        { id: 2, name: 'Айзада Муратова', date: '20.01.2026', score: 15, total: 20, time: '15:20' },
        { id: 3, name: 'Бекарыс Ибрагимов', date: '19.01.2026', score: 20, total: 20, time: '08:12' },
        { id: 4, name: 'Диана Сабитова', date: '19.01.2026', score: 12, total: 20, time: '18:30' },
        { id: 5, name: 'Ербол Хасенов', date: '18.01.2026', score: 9, total: 20, time: '22:10' },
    ];

    return (
        <div className="max-w-6xl mx-auto py-10 px-6">
            <div className="flex items-center gap-4 mb-8">
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                    <ChevronLeft className="w-6 h-6 text-slate-400" />
                </button>
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Статистика теста</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Физическая география Восточного Казахстана (Код: XJ92K)</p>
                </div>
                <div className="flex-1" />
                <button className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20">
                    <Download className="w-4 h-4" /> Экспорт (Excel)
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <StatCard icon={Users} label="Учеников" value="42" color="teal" />
                <StatCard icon={Trophy} label="Ср. балл" value="16.4 / 20" color="amber" />
                <StatCard icon={Clock} label="Ср. время" value="14:20" color="blue" />
                <StatCard icon={BarChart3} label="Успеваемость" value="82%" color="emerald" />
            </div>

            {/* Students Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50">
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Ученик</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Дата</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Результат</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Время</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Статус</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {mockStats.map(student => (
                            <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                                            <UserCircle className="w-6 h-6" />
                                        </div>
                                        <span className="font-bold text-slate-900 dark:text-white">{student.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex flex-col items-center">
                                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{student.date}</span>
                                        <span className="text-[10px] text-slate-400">12:30</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center font-black text-lg">
                                    <span className={student.score > 15 ? 'text-emerald-500' : student.score > 10 ? 'text-amber-500' : 'text-red-500'}>
                                        {student.score}
                                    </span>
                                    <span className="text-slate-300 dark:text-slate-700 mx-1">/</span>
                                    <span className="text-slate-400">{student.total}</span>
                                </td>
                                <td className="px-6 py-4 text-center text-sm font-medium text-slate-500">{student.time}</td>
                                <td className="px-6 py-4 text-right">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${student.score > 10 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                        {student.score > 10 ? 'Сдано' : 'Не сдано'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color }: any) {
    const colors: any = {
        teal: 'bg-teal-50 text-teal-600 border-teal-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100'
    };

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${colors[color]}`}>
                <Icon className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <h4 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{value}</h4>
        </div>
    );
}
