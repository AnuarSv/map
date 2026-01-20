import { useState, useEffect, useMemo, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import {
    MousePointer2,
    Pencil,
    Save,
    Locate,
    Sun,
    Moon,
    Eye,
    EyeOff,
    X,
    Droplets,
    Loader2,
    Plus,
    Minus,
    Map as MapIcon,
    Building2,
    Gem,
    Layers
} from 'lucide-react';
import { MapContainer as MapContainerOrig, GeoJSON as GeoJSONOrig } from 'react-leaflet';

const MapContainer = MapContainerOrig as any;
const GeoJSON = GeoJSONOrig as any;

const KZ_CENTER: [number, number] = [48.0, 67.0];

const CATEGORIES = [
    { id: 'water', name: 'Вода', icon: Droplets, color: 'text-blue-500' },
    { id: 'regions', name: 'Регионы', icon: MapIcon, color: 'text-purple-500' },
    { id: 'cities', name: 'Города', icon: Building2, color: 'text-emerald-500' },
    { id: 'minerals', name: 'Ресурсы', icon: Gem, color: 'text-amber-500' },
];

const MINERAL_TYPES = [
    { id: 'oil', name: 'Нефть' },
    { id: 'gas', name: 'Газ' },
    { id: 'coal', name: 'Уголь' },
    { id: 'iron', name: 'Железо' },
    { id: 'copper', name: 'Медь' },
    { id: 'gold', name: 'Золото' },
    { id: 'uranium', name: 'Уран' },
    { id: 'chrome', name: 'Хром' },
    { id: 'polymetals', name: 'Полиметаллы' },
    { id: 'zinc', name: 'Цинк' },
    { id: 'manganese', name: 'Марганец' },
    { id: 'rare_earth', name: 'Редкие земли' },
    { id: 'titanium', name: 'Титан' },
    { id: 'antimony', name: 'Сурьма' },
];

const MapEvents = ({ onLoad }: { onLoad: (m: L.Map) => void }) => {
    const map = useMap();
    useEffect(() => { onLoad(map); }, [map, onLoad]);
    return null;
};

export default function EditorPage() {
    const mapRef = useRef<L.Map | null>(null);
    const [activeCategory, setActiveCategory] = useState('water');
    const [loading, setLoading] = useState(true);
    const [mapTheme, setMapTheme] = useState<'dark' | 'light'>('dark');
    const [activeTool, setActiveTool] = useState<'pointer' | 'pencil' | 'place-mineral'>('pointer');
    const [selectedMineral, setSelectedMineral] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<number | string | null>(null);
    const [visibleLayers, setVisibleLayers] = useState<Set<string>>(new Set(['water', 'regions', 'cities', 'minerals']));
    const [hasChanges, setHasChanges] = useState(false);
    const [saving, setSaving] = useState(false);

    const [waterData, setWaterData] = useState<any>(null);
    const [regionsData, setRegionsData] = useState<any>(null);
    const [citiesData, setCitiesData] = useState<any>(null);
    const [mineralsData, setMineralsData] = useState<any>(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [water, regions, cities, minerals] = await Promise.all([
                    fetch('/data/kazakhstan-water-filtered.geojson').then(res => res.json()),
                    fetch('/data/kazakhstan-regions.geojson').then(res => res.json()),
                    fetch('/data/kazakhstan-cities.geojson').then(res => res.json()),
                    fetch('/data/kazakhstan-minerals.geojson').then(res => res.json()),
                ]);
                setWaterData(water);
                setRegionsData(regions);
                setCitiesData(cities);
                setMineralsData(minerals);
            } catch (e) { console.error(e); }
            setLoading(false);
        };
        load();
    }, []);

    const handleDragStart = (e: React.DragEvent, type: string) => {
        e.dataTransfer.setData('mineralType', type);
        setSelectedMineral(type);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('mineralType');
        if (!type || !mapRef.current) return;

        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const latlng = mapRef.current.containerPointToLatLng([x, y]);

        const newMineral = {
            type: 'Feature',
            properties: {
                id: `new-${Date.now()}`,
                name_ru: `Новое месторождение (${type})`,
                type: type
            },
            geometry: {
                type: 'Point',
                coordinates: [latlng.lng, latlng.lat]
            }
        };

        setMineralsData((prev: any) => ({
            ...prev,
            features: [...prev.features, newMineral]
        }));
        setHasChanges(true);
        setActiveTool('pointer');
        setSelectedMineral(null);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleMapClick = (e: L.LeafletMouseEvent) => {
        if (activeTool === 'place-mineral' && selectedMineral) {
            const newMineral = {
                type: 'Feature',
                properties: {
                    id: `new-${Date.now()}`,
                    name_ru: `Новое месторождение (${selectedMineral})`,
                    type: selectedMineral
                },
                geometry: {
                    type: 'Point',
                    coordinates: [e.latlng.lng, e.latlng.lat]
                }
            };
            setMineralsData((prev: any) => ({
                ...prev,
                features: [...prev.features, newMineral]
            }));
            setHasChanges(true);
            setActiveTool('pointer');
        }
    };

    const handleSave = async () => {
        setSaving(true);
        await new Promise(r => setTimeout(r, 1000));
        setHasChanges(false);
        setSaving(false);
    };

    const selectedObject = useMemo(() => {
        if (!selectedId) return null;
        const all = [
            ...(waterData?.features || []),
            ...(regionsData?.features || []),
            ...(citiesData?.features || []),
            ...(mineralsData?.features || [])
        ];
        return all.find((f: any) => (f.properties?.id || f.properties?.osm_id) === selectedId);
    }, [selectedId, waterData, regionsData, citiesData, mineralsData]);

    return (
        <div className="h-screen w-full flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden">
            {/* Sidebar Left */}
            <div className="w-80 flex bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 flex-col">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <h2 className="font-extrabold text-xl flex items-center gap-2">
                        <Layers className="w-6 h-6 text-emerald-600" />
                        Редактор
                    </h2>
                    <div className="flex gap-1">
                        <ToolBtn icon={mapTheme === 'dark' ? Sun : Moon} onClick={() => setMapTheme(t => t === 'dark' ? 'light' : 'dark')} tip="Смена темы" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-4 border-b border-slate-200 dark:border-slate-800">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex flex-col items-center py-4 transition-all border-b-2 ${activeCategory === cat.id ? 'border-emerald-600 bg-emerald-50/30' : 'border-transparent opacity-50 hover:opacity-100'}`}
                            >
                                <cat.icon className={`w-5 h-5 ${cat.color}`} />
                                <span className="text-[10px] mt-1 font-bold">{cat.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="p-6">
                        {activeCategory === 'minerals' ? (
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Палитра ресурсов</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {MINERAL_TYPES.map(m => (
                                        <button
                                            key={m.id}
                                            draggable="true"
                                            onDragStart={(e) => handleDragStart(e, m.id)}
                                            onClick={() => {
                                                setSelectedMineral(m.id);
                                                setActiveTool('place-mineral');
                                            }}
                                            className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all cursor-grab active:cursor-grabbing ${selectedMineral === m.id && activeTool === 'place-mineral' ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-100 dark:border-slate-800 hover:border-slate-300'}`}
                                        >
                                            <img src={`/icons/minerals/${m.id}.svg`} className="w-10 h-10" alt={m.name} />
                                            <span className="text-[10px] font-bold">{m.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Управление слоем</h3>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="font-bold text-sm">Отображение</span>
                                        <button
                                            onClick={() => setVisibleLayers(p => { const n = new Set(p); n.has(activeCategory) ? n.delete(activeCategory) : n.add(activeCategory); return n; })}
                                            className={`p-2 rounded-lg transition-all ${visibleLayers.has(activeCategory) ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}
                                        >
                                            {visibleLayers.has(activeCategory) ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <button
                                        className={`w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${activeTool === 'pencil' ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'}`}
                                        onClick={() => setActiveTool(activeTool === 'pencil' ? 'pointer' : 'pencil')}
                                    >
                                        <Pencil className="w-3.5 h-3.5" /> Ред. геометрию
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-slate-200 dark:border-slate-800">
                    <button
                        onClick={handleSave}
                        disabled={!hasChanges || saving}
                        className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${hasChanges ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Сохранить все
                    </button>
                </div>
            </div>

            {/* Map Area */}
            <div
                className="flex-1 relative"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
                    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-full px-6 py-2 shadow-xl pointer-events-auto flex items-center gap-3">
                        <div className="flex gap-2 pr-3 border-r border-slate-200 dark:border-slate-700">
                            <ToolBtn active={activeTool === 'pointer'} onClick={() => setActiveTool('pointer')} icon={MousePointer2} tip="Выбор" />
                            <ToolBtn active={activeTool === 'pencil'} onClick={() => setActiveTool('pencil')} icon={Pencil} tip="Вершины" />
                        </div>
                        <div className="flex gap-2">
                            <ToolBtn icon={Plus} onClick={() => mapRef.current?.zoomIn()} tip="Приблизить" />
                            <ToolBtn icon={Minus} onClick={() => mapRef.current?.zoomOut()} tip="Отдалить" />
                            <ToolBtn icon={Locate} onClick={() => mapRef.current?.setView(KZ_CENTER, 5)} tip="Сброс" />
                        </div>
                    </div>
                </div>

                <MapContainer center={KZ_CENTER} zoom={5} className="h-full w-full" zoomControl={false} attributionControl={false} preferCanvas>
                    <MapEvents onLoad={m => { mapRef.current = m; m.on('click', handleMapClick as any); }} />
                    <TileLayer url={mapTheme === 'dark' ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'} />

                    {visibleLayers.has('regions') && regionsData && (
                        <GeoJSON data={regionsData} style={{ color: '#64748b', weight: 1, fillOpacity: 0.1 }} />
                    )}
                    {visibleLayers.has('water') && waterData && (
                        <GeoJSON data={waterData} style={{ color: '#3b82f6', weight: 2, fillOpacity: 0.3 }} />
                    )}
                    {visibleLayers.has('cities') && citiesData && (
                        <GeoJSON
                            data={citiesData}
                            pointToLayer={(_f: any, ll: any) => L.circleMarker(ll, { radius: 4, fillColor: '#fff', color: '#000', weight: 2, fillOpacity: 1 })}
                        />
                    )}
                    {visibleLayers.has('minerals') && mineralsData && (
                        <GeoJSON
                            key={`minerals-${mineralsData.features.length}`}
                            data={mineralsData}
                            pointToLayer={(f: any, ll: any) => {
                                const type = f.properties?.type || 'gold';
                                return L.marker(ll, {
                                    icon: L.icon({ iconUrl: `/icons/minerals/${type}.svg`, iconSize: [24, 24], iconAnchor: [12, 12] })
                                }).on('click', () => setSelectedId(f.properties?.id || f.properties?.osm_id));
                            }}
                        />
                    )}
                </MapContainer>
            </div>

            {/* Right Panel */}
            <div className={`bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl transition-all duration-300 z-50 overflow-hidden ${selectedId ? 'w-80' : 'w-0'}`}>
                {selectedObject && (
                    <div className="w-80 h-full p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-lg font-extrabold tracking-tight">Свойства</h2>
                            <button onClick={() => setSelectedId(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <div className="flex-1 space-y-6">
                            <Field label="ID" value={selectedId} />
                            <Field label="Название (RU)" value={selectedObject.properties.name_ru} editable />
                            <Field label="Тип" value={selectedObject.properties.type || selectedObject.properties.object_type} />
                        </div>
                    </div>
                )}
            </div>

            {loading && (
                <div className="fixed inset-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-[3000] flex flex-col items-center justify-center">
                    <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
                    <p className="font-bold text-slate-900 dark:text-white uppercase tracking-widest text-xs">Загрузка данных...</p>
                </div>
            )}
        </div>
    );
}

function ToolBtn({ active, icon: Icon, onClick, tip }: any) {
    return (
        <button
            onClick={onClick}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all group relative ${active ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
            <Icon className="w-5 h-5" />
            <div className="absolute top-full mt-3 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[3000]">{tip}</div>
        </button>
    );
}

function Field({ label, value, editable }: any) {
    return (
        <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">{label}</label>
            {editable ? (
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold" defaultValue={value} />
            ) : (
                <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 font-mono text-sm border border-transparent">{value}</div>
            )}
        </div>
    );
}

function TileLayer({ url }: { url: string }) {
    const map = useMap();
    const lRef = useRef<L.TileLayer | null>(null);
    useEffect(() => {
        if (lRef.current) map.removeLayer(lRef.current);
        lRef.current = L.tileLayer(url).addTo(map);
        return () => { if (lRef.current) map.removeLayer(lRef.current); };
    }, [url, map]);
    return null;
}
