import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Droplets, Mountain, Building2, Gem, ArrowRight } from 'lucide-react';

const categories = [
    { id: 'regions', name: 'Области', count: '17 вопросов', icon: Map },
    { id: 'cities', name: 'Города', count: '40+ вопросов', icon: Building2 },
    { id: 'water', name: 'Водные ресурсы', count: '30 вопросов', icon: Droplets },
    { id: 'landforms', name: 'Рельеф', count: '25 вопросов', icon: Mountain },
    { id: 'minerals', name: 'Ископаемые', count: '50 вопросов', icon: Gem }
];

export default function QuizHomePage() {
    const navigate = useNavigate();
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    const toggleCategory = (id: string) => {
        setSelectedCategories(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const startQuiz = () => {
        if (selectedCategories.length === 0) return;

        if (selectedCategories.includes('minerals') && selectedCategories.length === 1) {
            navigate('/quiz/minerals-batch');
        } else {
            navigate(`/quiz/category/${selectedCategories[0]}`);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-8 md:p-12 font-sans">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-3xl font-semibold tracking-tight mb-2">Конструктор обучения</h1>
                    <p className="text-slate-500 text-lg">Выберите темы для тестирования</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
                    {categories.map((cat) => {
                        const isSelected = selectedCategories.includes(cat.id);
                        return (
                            <button
                                key={cat.id}
                                onClick={() => toggleCategory(cat.id)}
                                className={`
                                    group flex flex-col items-start p-6 rounded-xl border transition-all duration-200 text-left
                                    ${isSelected
                                        ? 'border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-transparent'
                                    }
                                `}
                            >
                                <cat.icon className={`w-6 h-6 mb-4 ${isSelected ? 'text-emerald-400 dark:text-emerald-600' : 'text-slate-400'}`} />
                                <span className="font-semibold text-lg block mb-1">{cat.name}</span>
                                <span className={`text-sm ${isSelected ? 'text-slate-400 dark:text-slate-500' : 'text-slate-500'}`}>{cat.count}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-8">
                    <div className="text-slate-500">
                        {selectedCategories.length === 0
                            ? 'Выберите категорию'
                            : `Выбрано: ${selectedCategories.length}`}
                    </div>

                    <button
                        onClick={startQuiz}
                        disabled={selectedCategories.length === 0}
                        className={`
                            flex items-center gap-3 px-8 py-3 rounded-lg font-medium transition-all duration-200
                            ${selectedCategories.length > 0
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                : 'bg-slate-100 dark:bg-slate-900 text-slate-400 cursor-not-allowed'
                            }
                        `}
                    >
                        Начать тест
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
