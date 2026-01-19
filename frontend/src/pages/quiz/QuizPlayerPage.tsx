import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer as MapContainerOrig, GeoJSON as GeoJSONOrig, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CheckCircle, XCircle, Clock, ArrowRight, Trophy, RotateCcw, Home } from 'lucide-react';

const MapContainer = MapContainerOrig as any;
const GeoJSON = GeoJSONOrig as any;

const CATEGORY_CONFIG: Record<string, { file: string; nameField: string; title: string }> = {
    regions: { file: '/data/kazakhstan-regions.geojson', nameField: 'name_ru', title: 'Области Казахстана' },
    cities: { file: '/data/kazakhstan-cities.geojson', nameField: 'name_ru', title: 'Города Казахстана' },
    water: { file: '/data/kazakhstan-water.geojson', nameField: 'name_ru', title: 'Водные ресурсы' },
    minerals: { file: '/data/kazakhstan-minerals.geojson', nameField: 'name_ru', title: 'Полезные ископаемые' },
    landforms: { file: '/data/kazakhstan-landforms.geojson', nameField: 'name_ru', title: 'Рельеф Казахстана' }
};

const KZ_CENTER: [number, number] = [48.0, 67.0];

const MapLayer = () => {
    const map = useMap();
    useEffect(() => {
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 10 }).addTo(map);
    }, [map]);
    return null;
};

export default function QuizPlayerPage() {
    const { category } = useParams();
    const navigate = useNavigate();
    const config = CATEGORY_CONFIG[category || 'regions'];

    const [data, setData] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [answered, setAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState(15);
    const [gameOver, setGameOver] = useState(false);

    // Load data
    useEffect(() => {
        fetch(config.file)
            .then(res => res.json())
            .then(d => {
                setData(d);
                const shuffled = [...d.features].sort(() => Math.random() - 0.5).slice(0, 10);
                setQuestions(shuffled);
            });
    }, [config.file]);

    // Timer
    useEffect(() => {
        if (answered || gameOver || !questions.length) return;
        const timer = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    handleAnswer(null);
                    return 15;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [answered, gameOver, currentIdx, questions.length]);

    const currentQuestion = questions[currentIdx];

    const handleAnswer = (featureId: number | null) => {
        if (answered) return;
        setAnswered(true);
        setSelectedId(featureId);

        const correctId = currentQuestion?.properties?.id;
        const correct = featureId === correctId;
        setIsCorrect(correct);
        if (correct) setScore(s => s + 1);
    };

    const nextQuestion = () => {
        if (currentIdx + 1 >= questions.length) {
            setGameOver(true);
        } else {
            setCurrentIdx(i => i + 1);
            setAnswered(false);
            setSelectedId(null);
            setTimeLeft(15);
        }
    };

    const restart = () => {
        const shuffled = [...data.features].sort(() => Math.random() - 0.5).slice(0, 10);
        setQuestions(shuffled);
        setCurrentIdx(0);
        setScore(0);
        setAnswered(false);
        setSelectedId(null);
        setTimeLeft(15);
        setGameOver(false);
    };

    const getStyle = useCallback((feature: any) => {
        const id = feature.properties?.id;
        const correctId = currentQuestion?.properties?.id;

        if (answered) {
            if (id === correctId) return { color: '#059669', weight: 4, fillOpacity: 0.6 }; // Emerald-600
            if (id === selectedId && !isCorrect) return { color: '#ef4444', weight: 3, fillOpacity: 0.4 }; // Red-500
        }

        return { color: '#64748b', weight: 2, fillOpacity: 0.2 }; // Slate-500
    }, [answered, currentQuestion, selectedId, isCorrect]);

    const onEachFeature = useCallback((feature: any, layer: L.Layer) => {
        layer.on('click', () => {
            if (!answered) handleAnswer(feature.properties?.id);
        });
    }, [answered]);

    if (!data || !currentQuestion) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (gameOver) {
        const percentage = Math.round((score / questions.length) * 100);
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-10 max-w-md w-full mx-4 text-center shadow-xl border border-slate-200 dark:border-slate-700">
                    <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Trophy className="w-10 h-10 text-amber-500" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Тест завершён!</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">{config.title}</p>

                    <div className="mb-8">
                        <span className="text-6xl font-black text-emerald-600">{score}</span>
                        <span className="text-3xl text-slate-400 font-bold">/{questions.length}</span>
                        <div className="text-slate-500 mt-2 font-medium">Правильных ответов ({percentage}%)</div>
                    </div>

                    <div className="flex gap-4">
                        <button onClick={restart} className="flex-1 px-6 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20">
                            <RotateCcw className="w-5 h-5" /> Ещё раз
                        </button>
                        <button onClick={() => navigate('/quiz')} className="flex-1 px-6 py-4 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-2">
                            <Home className="w-5 h-5" /> Домой
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex items-center justify-between z-50">
                <div>
                    <h1 className="font-bold text-xl text-slate-900 dark:text-white">{config.title}</h1>
                    <p className="text-sm text-slate-500 font-medium mt-0.5">Вопрос {currentIdx + 1} из {questions.length}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors ${timeLeft <= 5 ? 'bg-red-50 text-red-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                        <Clock className="w-5 h-5" /> {timeLeft}с
                    </div>
                    <div className="px-5 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg font-bold border border-emerald-100 dark:border-emerald-800">
                        {score} очков
                    </div>
                </div>
            </div>

            {/* Question */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-8 text-center shadow-sm z-40">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Найдите на карте</p>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white">{currentQuestion.properties[config.nameField] || 'Неизвестно'}</h2>
            </div>

            {/* Map */}
            <div className="flex-1 relative">
                <MapContainer
                    center={KZ_CENTER}
                    zoom={5}
                    className="h-full w-full bg-slate-100"
                    zoomControl={false}
                    preferCanvas={true}
                >
                    <MapLayer />
                    {data && (
                        <GeoJSON
                            key={`q-${currentIdx}-${answered}`}
                            data={data}
                            style={getStyle}
                            onEachFeature={onEachFeature}
                            pointToLayer={(feature: any, latlng: any) => {
                                const id = feature.properties?.id;
                                const correctId = currentQuestion?.properties?.id;

                                let color = '#64748b'; // Slate-500 default
                                let fillOpacity = 0.5;
                                let radius = 8;
                                let weight = 2; // Default border weight

                                if (answered) {
                                    if (id === correctId) { color = '#059669'; fillOpacity = 0.9; weight = 3; } // Emerald-600
                                    else if (id === selectedId && !isCorrect) { color = '#ef4444'; fillOpacity = 0.9; weight = 3; } // Red-500
                                }

                                return L.circleMarker(latlng, {
                                    radius,
                                    fillColor: color,
                                    color: '#fff',
                                    weight,
                                    opacity: 1,
                                    fillOpacity
                                });
                            }}
                        />
                    )}
                </MapContainer>

                {/* Feedback */}
                {answered && (
                    <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 px-8 py-5 rounded-2xl shadow-2xl flex items-center gap-6 z-[1000] border ${isCorrect ? 'bg-white border-emerald-100 text-emerald-700' : 'bg-white border-red-100 text-red-600'}`}>
                        <div className={`p-2 rounded-full ${isCorrect ? 'bg-emerald-100' : 'bg-red-100'}`}>
                            {isCorrect ? <CheckCircle className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                        </div>
                        <div>
                            <div className="font-extrabold text-xl">{isCorrect ? 'Верно!' : 'Ошибка!'}</div>
                            {!isCorrect && <div className="text-sm text-slate-500 font-medium">Правильный ответ подсвечен зеленым</div>}
                        </div>
                        <button onClick={nextQuestion} className="ml-4 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg">
                            Далее <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
