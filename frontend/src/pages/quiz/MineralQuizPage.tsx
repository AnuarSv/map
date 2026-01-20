import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer as MapContainerOrig, GeoJSON as GeoJSONOrig, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CheckCircle, XCircle, ArrowRight, Trophy, RotateCcw, Grab, MapPin } from 'lucide-react';

const MapContainer = MapContainerOrig as any;
const GeoJSON = GeoJSONOrig as any;

const KZ_CENTER: [number, number] = [48.0, 67.0];

const MapLayer = () => {
    const map = useMap();
    useEffect(() => {
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);
    }, [map]);
    return null;
};

export default function MineralQuizPage() {
    const navigate = useNavigate();
    const mapRef = useRef<L.Map | null>(null);
    const [allMinerals, setAllMinerals] = useState<any[]>([]);
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [answered, setAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [loading, setLoading] = useState(true);
    const [regionsData, setRegionsData] = useState<any>(null);

    // Points placed by user
    const [placedIcon, setPlacedIcon] = useState<{ lat: number, lng: number, type: string } | null>(null);

    useEffect(() => {
        Promise.all([
            fetch('/data/kazakhstan-minerals.geojson').then(res => res.json()),
            fetch('/data/kazakhstan-regions.geojson').then(res => res.json())
        ]).then(([minerals, regions]) => {
            setAllMinerals(minerals.features);
            setRegionsData(regions);
            const shuffled = [...minerals.features]
                .sort(() => Math.random() - 0.5)
                .slice(0, 10);
            setQuestions(shuffled);
            setLoading(false);
        });
    }, []);

    const currentQuestion = questions[currentIdx];

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (answered || !mapRef.current) return;

        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const latlng = mapRef.current.containerPointToLatLng([x, y]);
        const targetCoords = currentQuestion.geometry.coordinates; // [lng, lat]

        // Calculate distance (simple Euclidean for quiz purposes or better L.latLng.distanceTo)
        const targetLatLng = L.latLng(targetCoords[1], targetCoords[0]);
        const distance = latlng.distanceTo(targetLatLng); // in meters

        // Allow 50km tolerance? Kazakhstan is big. 
        const isNear = distance < 80000; // 80km

        setPlacedIcon({ lat: latlng.lat, lng: latlng.lng, type: currentQuestion.properties.type || 'gold' });
        setAnswered(true);
        setIsCorrect(isNear);
        if (isNear) setScore(s => s + 1);
    };

    const nextQuestion = () => {
        if (currentIdx + 1 >= questions.length) {
            setGameOver(true);
        } else {
            setCurrentIdx(i => i + 1);
            setAnswered(false);
            setPlacedIcon(null);
        }
    };

    const restart = () => {
        const shuffled = [...allMinerals].sort(() => Math.random() - 0.5).slice(0, 10);
        setQuestions(shuffled);
        setCurrentIdx(0);
        setScore(0);
        setAnswered(false);
        setPlacedIcon(null);
        setGameOver(false);
    };

    if (loading) return <div className="h-screen flex items-center justify-center font-bold">Загрузка...</div>;

    if (gameOver) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl border border-slate-200 dark:border-slate-800">
                    <Trophy className="w-16 h-16 text-amber-500 mx-auto mb-6" />
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Итоги теста</h2>
                    <p className="text-6xl font-black text-emerald-600 my-6">{score}<span className="text-3xl text-slate-300">/10</span></p>
                    <div className="flex gap-4">
                        <button onClick={restart} className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                            <RotateCcw className="w-5 h-5" /> Заново
                        </button>
                        <button onClick={() => navigate('/quiz')} className="flex-1 py-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl">
                            Домой
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 flex items-center justify-between z-50 shadow-sm">
                <div>
                    <h1 className="font-extrabold text-xl text-slate-900 dark:text-white uppercase tracking-tight">Размещение месторождений</h1>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Вопрос {currentIdx + 1} из 10</p>
                </div>
                <div className="px-6 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full font-black border border-emerald-100 dark:border-emerald-800">
                    СЧЕТ: {score}
                </div>
            </div>

            <div className="flex-1 flex relative">
                {/* Left Panel: Target */}
                <div className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center justify-center text-center z-40">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Перетащите на карту</p>
                    <div
                        draggable={!answered}
                        onDragStart={(e) => e.dataTransfer.setData('type', currentQuestion.properties.type)}
                        className={`w-32 h-32 rounded-3xl bg-slate-50 dark:bg-slate-800 border-4 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center mb-6 cursor-grab active:cursor-grabbing transition-transform hover:scale-110 ${answered ? 'opacity-30' : ''}`}
                    >
                        <img src={`/icons/minerals/${currentQuestion.properties.type || 'gold'}.svg`} className="w-20 h-20" alt="mineral" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight mb-2">
                        {currentQuestion.properties.name_ru || 'Месторождение'}
                    </h2>
                    <div className="flex items-center gap-2 text-slate-500 font-bold text-sm uppercase">
                        <MapPin className="w-4 h-4" /> Казахстан
                    </div>

                    {!answered && (
                        <div className="mt-12 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 flex flex-col items-center gap-3">
                            <Grab className="w-8 h-8 text-emerald-600 animate-bounce" />
                            <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-200 uppercase tracking-widest text-center">Зажмите и тяните на предполагаемое место</p>
                        </div>
                    )}
                </div>

                {/* Map Area */}
                <div
                    className="flex-1 relative bg-slate-100"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                >
                    <MapContainer
                        center={KZ_CENTER}
                        zoom={5}
                        className="h-full w-full"
                        zoomControl={false}
                        attributionControl={false}
                    >
                        <MapLayer />
                        <MapEvents onLoad={(m) => { mapRef.current = m; }} />

                        {regionsData && <GeoJSON data={regionsData} style={{ color: '#cbd5e1', weight: 1, fillOpacity: 0.1 }} />}

                        {placedIcon && (
                            <GeoJSON
                                key="placed"
                                data={{
                                    type: 'Feature',
                                    properties: { type: placedIcon.type },
                                    geometry: { type: 'Point', coordinates: [placedIcon.lng, placedIcon.lat] }
                                }}
                                pointToLayer={(f: any, ll: any) => L.marker(ll, {
                                    icon: L.icon({ iconUrl: `/icons/minerals/${f.properties.type}.svg`, iconSize: [32, 32], iconAnchor: [16, 16] })
                                })}
                            />
                        )}

                        {answered && (
                            <GeoJSON
                                key="answer"
                                data={currentQuestion}
                                pointToLayer={(f: any, ll: any) => L.marker(ll, {
                                    icon: L.icon({ iconUrl: `/icons/minerals/${f.properties.type || 'gold'}.svg`, iconSize: [32, 32], iconAnchor: [16, 16] }),
                                    opacity: 0.5
                                }).bindTooltip('Правильное место', { permanent: true, direction: 'top' })}
                            />
                        )}
                    </MapContainer>

                    {/* Feedback Overlay */}
                    {answered && (
                        <div className="absolute inset-x-0 bottom-0 p-8 pb-[max(2rem,env(safe-area-inset-bottom))] flex justify-center z-[2000] animate-in slide-in-from-bottom duration-300">
                            <div className={`w-full max-w-2xl px-10 py-6 rounded-[2rem] shadow-2xl flex items-center gap-8 border backdrop-blur-2xl ${isCorrect ? 'bg-white/95 dark:bg-slate-900/95 border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400' : 'bg-white/95 dark:bg-slate-900/95 border-red-100 dark:border-red-800 text-red-600 dark:text-red-400'}`}>
                                <div className={`p-4 rounded-3xl ${isCorrect ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                                    {isCorrect ? <CheckCircle className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
                                </div>
                                <div className="flex-1">
                                    <div className="font-black text-3xl tracking-tight leading-none mb-1">{isCorrect ? 'ОТЛИЧНО!' : 'ПРОМАХ!'}</div>
                                    <div className="text-sm font-bold opacity-70 uppercase tracking-widest">{isCorrect ? 'Вы точно знаете карту' : 'Посмотрите, где оно на самом деле'}</div>
                                </div>
                                <button
                                    onClick={nextQuestion}
                                    className="px-10 py-5 bg-slate-900 dark:bg-emerald-600 text-white rounded-[1.25rem] font-black uppercase text-sm tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/20 flex items-center gap-3"
                                >
                                    ДАЛЕЕ <ArrowRight className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function MapEvents({ onLoad }: { onLoad: (m: L.Map) => void }) {
    const map = useMap();
    useEffect(() => { if (map) onLoad(map); }, [map, onLoad]);
    return null;
}
