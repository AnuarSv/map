import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer as MapContainerOrig, GeoJSON as GeoJSONOrig, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CheckCircle, XCircle, Trophy, RotateCcw, Home, ArrowRight, Trash2 } from 'lucide-react';

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

interface PlacedMineral {
    id: string;
    name: string;
    type: string;
    placedLat: number;
    placedLng: number;
    correctLat: number;
    correctLng: number;
}

export default function MineralBatchQuizPage() {
    const navigate = useNavigate();
    const mapRef = useRef<L.Map | null>(null);
    const [allMinerals, setAllMinerals] = useState<any[]>([]);
    const [questions, setQuestions] = useState<any[]>([]);
    const [regionsData, setRegionsData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Placed minerals by user
    const [placedMinerals, setPlacedMinerals] = useState<PlacedMineral[]>([]);
    const [draggingMineral, setDraggingMineral] = useState<any | null>(null);

    // Game state
    const [showResults, setShowResults] = useState(false);
    const [results, setResults] = useState<{ mineral: PlacedMineral; isCorrect: boolean; distance: number }[]>([]);

    useEffect(() => {
        Promise.all([
            fetch('/data/kazakhstan-minerals.geojson').then(res => res.json()),
            fetch('/data/kazakhstan-regions.geojson').then(res => res.json())
        ]).then(([minerals, regions]) => {
            setAllMinerals(minerals.features);
            setRegionsData(regions);
            const shuffled = [...minerals.features]
                .sort(() => Math.random() - 0.5)
                .slice(0, 8); // 8 minerals for batch mode
            setQuestions(shuffled);
            setLoading(false);
        });
    }, []);

    const handleDragStart = (e: React.DragEvent, mineral: any) => {
        e.dataTransfer.setData('mineralId', mineral.properties.id);
        const img = new Image();
        img.src = `/icons/minerals/${mineral.properties.type || 'gold'}.svg`;
        e.dataTransfer.setDragImage(img, 20, 20);
        setDraggingMineral(mineral);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (!mapRef.current || !draggingMineral) return;

        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const latlng = mapRef.current.containerPointToLatLng([x, y]);
        const targetCoords = draggingMineral.geometry.coordinates;

        const newPlaced: PlacedMineral = {
            id: draggingMineral.properties.id,
            name: draggingMineral.properties.name_ru,
            type: draggingMineral.properties.type || 'gold',
            placedLat: latlng.lat,
            placedLng: latlng.lng,
            correctLat: targetCoords[1],
            correctLng: targetCoords[0]
        };

        // Remove if already placed, then add new position
        setPlacedMinerals(prev => [...prev.filter(p => p.id !== newPlaced.id), newPlaced]);
        setDraggingMineral(null);
    };

    const removeMineral = (id: string) => {
        setPlacedMinerals(prev => prev.filter(p => p.id !== id));
    };

    const checkAnswers = () => {
        const resultsArr = placedMinerals.map(placed => {
            const placedLatLng = L.latLng(placed.placedLat, placed.placedLng);
            const correctLatLng = L.latLng(placed.correctLat, placed.correctLng);
            const distance = placedLatLng.distanceTo(correctLatLng);
            const isCorrect = distance < 80000; // 80km tolerance
            return { mineral: placed, isCorrect, distance };
        });
        setResults(resultsArr);
        setShowResults(true);
    };

    const restart = () => {
        const shuffled = [...allMinerals].sort(() => Math.random() - 0.5).slice(0, 8);
        setQuestions(shuffled);
        setPlacedMinerals([]);
        setResults([]);
        setShowResults(false);
    };

    const placedIds = placedMinerals.map(p => p.id);
    const unplacedMinerals = questions.filter(q => !placedIds.includes(q.properties.id));
    const allPlaced = unplacedMinerals.length === 0 && questions.length > 0;
    const score = results.filter(r => r.isCorrect).length;

    if (loading) return <div className="h-screen flex items-center justify-center font-bold">Загрузка...</div>;

    if (showResults) {
        return (
            <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
                <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 flex items-center justify-between z-50">
                    <div>
                        <h1 className="font-extrabold text-xl text-slate-900 dark:text-white">Результаты</h1>
                        <p className="text-sm text-slate-500 font-bold mt-1">Групповое размещение</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={restart} className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all flex items-center gap-2">
                            <RotateCcw className="w-5 h-5" /> Заново
                        </button>
                        <button onClick={() => navigate('/quiz')} className="px-5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                            <Home className="w-5 h-5" /> Домой
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex">
                    {/* Results Panel */}
                    <div className="w-96 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 text-center">
                            <Trophy className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                            <div className="text-4xl font-black text-emerald-600">{score}<span className="text-2xl text-slate-300">/{questions.length}</span></div>
                            <p className="text-slate-500 font-medium mt-1">Правильных ответов</p>
                        </div>
                        <div className="p-4 space-y-2">
                            {results.map(r => (
                                <div key={r.mineral.id} className={`p-4 rounded-xl border ${r.isCorrect ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
                                    <div className="flex items-center gap-3">
                                        <img src={`/icons/minerals/${r.mineral.type}.svg`} className="w-8 h-8" alt="mineral" />
                                        <div className="flex-1">
                                            <div className="font-bold text-slate-900 dark:text-white">{r.mineral.name}</div>
                                            <div className="text-xs text-slate-500">{Math.round(r.distance / 1000)} км от цели</div>
                                        </div>
                                        {r.isCorrect ? <CheckCircle className="w-6 h-6 text-emerald-600" /> : <XCircle className="w-6 h-6 text-red-500" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Map with results */}
                    <div className="flex-1">
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

                            {/* Show placed positions with lines to correct */}
                            {results.map(r => (
                                <GeoJSON
                                    key={`line-${r.mineral.id}`}
                                    data={{
                                        type: 'Feature',
                                        geometry: {
                                            type: 'LineString',
                                            coordinates: [
                                                [r.mineral.placedLng, r.mineral.placedLat],
                                                [r.mineral.correctLng, r.mineral.correctLat]
                                            ]
                                        }
                                    }}
                                    style={{ color: r.isCorrect ? '#059669' : '#ef4444', weight: 2, dashArray: '4,4' }}
                                />
                            ))}

                            {/* Placed markers */}
                            {results.map(r => (
                                <GeoJSON
                                    key={`placed-${r.mineral.id}`}
                                    data={{
                                        type: 'Feature',
                                        properties: { type: r.mineral.type },
                                        geometry: { type: 'Point', coordinates: [r.mineral.placedLng, r.mineral.placedLat] }
                                    }}
                                    pointToLayer={(f: any, ll: any) => L.marker(ll, {
                                        icon: L.icon({ iconUrl: `/icons/minerals/${f.properties.type}.svg`, iconSize: [28, 28], iconAnchor: [14, 14] })
                                    })}
                                />
                            ))}

                            {/* Correct positions */}
                            {results.map(r => (
                                <GeoJSON
                                    key={`correct-${r.mineral.id}`}
                                    data={{
                                        type: 'Feature',
                                        properties: { type: r.mineral.type },
                                        geometry: { type: 'Point', coordinates: [r.mineral.correctLng, r.mineral.correctLat] }
                                    }}
                                    pointToLayer={(_f: any, ll: any) => L.circleMarker(ll, {
                                        radius: 12,
                                        fillColor: r.isCorrect ? '#059669' : '#ef4444',
                                        color: '#fff',
                                        weight: 3,
                                        fillOpacity: 0.8
                                    }).bindTooltip(r.mineral.name, { permanent: false, direction: 'top' })}
                                />
                            ))}
                        </MapContainer>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 flex items-center justify-between z-50 shadow-sm">
                <div>
                    <h1 className="font-extrabold text-xl text-slate-900 dark:text-white uppercase tracking-tight">Расставьте месторождения</h1>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">
                        Размещено: {placedMinerals.length} / {questions.length}
                    </p>
                </div>
                <button
                    onClick={checkAnswers}
                    disabled={!allPlaced}
                    className={`px-8 py-3 font-bold rounded-xl transition-all flex items-center gap-2 ${allPlaced ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}
                >
                    Проверить <ArrowRight className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 flex relative">
                {/* Left Panel: Minerals to place */}
                <div className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                            Перетащите все на карту
                        </p>
                    </div>

                    {/* Unplaced minerals */}
                    <div className="p-4 space-y-3">
                        {unplacedMinerals.map(mineral => (
                            <div
                                key={mineral.properties.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, mineral)}
                                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 cursor-grab active:cursor-grabbing hover:border-emerald-300 hover:bg-emerald-50/50 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/20 transition-all flex items-center gap-3"
                            >
                                <img src={`/icons/minerals/${mineral.properties.type || 'gold'}.svg`} className="w-10 h-10" alt="mineral" />
                                <div className="flex-1 font-bold text-slate-900 dark:text-white text-sm">
                                    {mineral.properties.name_ru}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Placed minerals */}
                    {placedMinerals.length > 0 && (
                        <>
                            <div className="p-4 border-t border-b border-slate-100 dark:border-slate-800">
                                <p className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em]">
                                    Размещено на карте
                                </p>
                            </div>
                            <div className="p-4 space-y-2">
                                {placedMinerals.map(placed => (
                                    <div
                                        key={placed.id}
                                        className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3"
                                    >
                                        <img src={`/icons/minerals/${placed.type}.svg`} className="w-8 h-8" alt="mineral" />
                                        <div className="flex-1 font-bold text-slate-900 dark:text-white text-sm">
                                            {placed.name}
                                        </div>
                                        <button onClick={() => removeMineral(placed.id)} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </>
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

                        {/* Show placed minerals on map */}
                        {placedMinerals.map(placed => (
                            <GeoJSON
                                key={`map-${placed.id}`}
                                data={{
                                    type: 'Feature',
                                    properties: { type: placed.type, name: placed.name },
                                    geometry: { type: 'Point', coordinates: [placed.placedLng, placed.placedLat] }
                                }}
                                pointToLayer={(f: any, ll: any) => L.marker(ll, {
                                    icon: L.icon({ iconUrl: `/icons/minerals/${f.properties.type}.svg`, iconSize: [32, 32], iconAnchor: [16, 16] })
                                }).bindTooltip(f.properties.name, { permanent: false, direction: 'top' })}
                            />
                        ))}
                    </MapContainer>

                    {!allPlaced && (
                        <div className="absolute bottom-0 inset-x-0 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] flex justify-center pointer-events-none z-[1000]">
                            <div className="px-6 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold">
                                Перетащите все месторождения на карту, затем нажмите «Проверить»
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
