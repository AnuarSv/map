import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Droplets, Mountain, Building2, Gem, Play, Sparkles, CheckCircle2 } from 'lucide-react';

const categories = [
    { id: 'regions', name: 'Области', icon: Map, color: 'text-blue-500', bgColor: 'bg-blue-50', darkBg: 'dark:bg-blue-900/20' },
    { id: 'cities', name: 'Города', icon: Building2, color: 'text-emerald-500', bgColor: 'bg-emerald-50', darkBg: 'dark:bg-emerald-900/20' },
    { id: 'water', name: 'Водные ресурсы', icon: Droplets, color: 'text-cyan-500', bgColor: 'bg-cyan-50', darkBg: 'dark:bg-cyan-900/20' },
    { id: 'landforms', name: 'Рельеф', icon: Mountain, color: 'text-violet-500', bgColor: 'bg-violet-50', darkBg: 'dark:bg-violet-900/20' },
    { id: 'minerals', name: 'Месторождения', icon: Gem, color: 'text-amber-500', bgColor: 'bg-amber-50', darkBg: 'dark:bg-amber-900/20' }
];

export default function QuizHomePage() {
    const navigate = useNavigate();
    const [selectedCategories, setSelectedCategories] = useState<string[]>(['regions']);

    const toggleCategory = (id: string) => {
        setSelectedCategories(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const startQuiz = () => {
        if (selectedCategories.length === 0) return;
        // If one category, go to specific, if multiple, we'd need a mixed player
        // For now, let's just go to the first one or implement mixed logic
        navigate(`/quiz/category/${selectedCategories[0]}`);
    };

    return (
        <div className="max-w-4xl mx-auto py-10">
            {/* Minimalist Hero */}
            <div className="mb-12 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-semibold mb-4 border border-emerald-100 dark:border-emerald-800">
                    <Sparkles className="w-4 h-4" /> Конструктор обучения
                </div>
                <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">Выберите темы для изучения</h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto">
                    Создайте свой индивидуальный путь обучения географии Казахстана.
                </p>
            </div>

            {/* Constructor Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                {categories.map((cat) => {
                    const isSelected = selectedCategories.includes(cat.id);
                    return (
                        <button
                            key={cat.id}
                            onClick={() => toggleCategory(cat.id)}
                            className={`flex items-center gap-4 p-5 rounded-xl border-2 transition-all text-left ${isSelected
                                ? 'border-emerald-500 bg-white dark:bg-emerald-900/10 shadow-sm'
                                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800'
                                }`}
                        >
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${cat.bgColor} ${cat.darkBg} border border-black/5 dark:border-white/10`}>
                                <cat.icon className={`w-6 h-6 ${cat.color}`} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-900 dark:text-white text-lg">{cat.name}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Добавить в тест</p>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                                {isSelected && <CheckCircle2 className="w-4 h-4" />}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Start Button */}
            <div className="flex flex-col items-center gap-4">
                <button
                    onClick={startQuiz}
                    disabled={selectedCategories.length === 0}
                    className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95 flex items-center gap-3"
                >
                    <Play className="w-5 h-5 fill-current" />
                    <span className="text-lg">Начать обучение</span>
                </button>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {selectedCategories.length === 0
                        ? 'Выберите хотя бы одну тему'
                        : `Выбрано тем: ${selectedCategories.length}`}
                </p>
            </div>

            {/* Visual Guide Placeholder */}
            <div className="mt-20 border-t border-slate-200 dark:border-slate-800 pt-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2 text-center md:text-left">
                        <div className="text-emerald-600 font-bold text-lg mb-2">01. Выбор</div>
                        <p className="text-sm text-slate-500 leading-relaxed">Отметьте интересующие вас разделы географии: от городов до полезных ископаемых.</p>
                    </div>
                    <div className="space-y-2 text-center md:text-left">
                        <div className="text-emerald-600 font-bold text-lg mb-2">02. Практика</div>
                        <p className="text-sm text-slate-500 leading-relaxed">Интерактивная карта поможет визуально запомнить расположение объектов.</p>
                    </div>
                    <div className="space-y-2 text-center md:text-left">
                        <div className="text-emerald-600 font-bold text-lg mb-2">03. Результат</div>
                        <p className="text-sm text-slate-500 leading-relaxed">Отслеживайте свой прогресс и улучшайте знания с каждым тестом.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
