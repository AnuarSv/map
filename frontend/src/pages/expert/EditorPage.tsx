import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
    Search,
    Loader2,
    Plus,
    Minus,
    Zap
} from 'lucide-react';
import { MapContainer as MapContainerOrig, GeoJSON as GeoJSONOrig } from 'react-leaflet';

const MapContainer = MapContainerOrig as any;
const GeoJSON = GeoJSONOrig as any;

// --- IndexedDB Cache ---
const DB_NAME = 'watermap-cache';
const STORE_NAME = 'geojson';
const CACHE_KEY = 'kazakhstan-water';

async function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onerror = () => reject(req.error);
        req.onsuccess = () => resolve(req.result);
        req.onupgradeneeded = () => {
            req.result.createObjectStore(STORE_NAME);
        };
    });
}

async function getCachedData(): Promise<any | null> {
    try {
        const db = await openDB();
        return new Promise((resolve) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const req = store.get(CACHE_KEY);
            req.onsuccess = () => resolve(req.result || null);
            req.onerror = () => resolve(null);
        });
    } catch { return null; }
}

async function setCachedData(data: any): Promise<void> {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(data, CACHE_KEY);
    } catch { /* ignore */ }
}

// --- Configuration ---
const TILE_LAYERS = {
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
};

const TYPE_COLORS: Record<string, string> = {
    river: '#3b82f6', canal: '#60a5fa', lake: '#06b6d4',
    reservoir: '#0891b2', glacier: '#a5f3fc', spring: '#22d3ee'
};

const KZ_CENTER: [number, number] = [48.0, 67.0];

// --- Components ---
const MapBaseLayer = ({ theme }: { theme: 'dark' | 'light' }) => {
    const map = useMap();
    const layerRef = useRef<L.TileLayer | null>(null);

    useEffect(() => {
        if (layerRef.current) map.removeLayer(layerRef.current);
        layerRef.current = L.tileLayer(TILE_LAYERS[theme], { maxZoom: 19 }).addTo(map);
        return () => { if (layerRef.current) map.removeLayer(layerRef.current); };
    }, [theme, map]);

    return null;
};

const MapEvents = ({ onLoad }: { onLoad: (m: L.Map) => void }) => {
    const map = useMap();
    useEffect(() => { onLoad(map); }, [map, onLoad]);
    return null;
};

export default function EditorPage() {
    const mapRef = useRef<L.Map | null>(null);
    const geoJsonRef = useRef<L.GeoJSON | null>(null);
    const editLayerRef = useRef<L.Layer | null>(null);
    const [zoom, setZoom] = useState(5);
    const [fullData, setFullData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [fromCache, setFromCache] = useState(false);
    const [mapTheme, setMapTheme] = useState<'dark' | 'light'>('dark');
    const [activeTool, setActiveTool] = useState<'pointer' | 'pencil'>('pointer');
    const [selectedId, setSelectedId] = useState<number | string | null>(null);
    const [visibleTypes, setVisibleTypes] = useState<Set<string>>(new Set(['river', 'lake', 'reservoir', 'canal']));
    const [searchQuery, setSearchQuery] = useState('');
    const [hasChanges, setHasChanges] = useState(false);
    const [saving, setSaving] = useState(false);

    // Load with cache-first strategy
    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);

            // 1. Try cache first (instant)
            const cached = await getCachedData();
            if (cached && !cancelled) {
                setFullData(cached);
                setFromCache(true);
                setLoading(false);
            }

            // 2. Fetch fresh in background
            try {
                const res = await fetch('/data/kazakhstan-water.geojson');
                const data = await res.json();
                if (!cancelled) {
                    setFullData(data);
                    setLoading(false);
                    setCachedData(data); // Update cache
                    setFromCache(false);
                }
            } catch {
                if (!cancelled && !cached) setLoading(false);
            }
        }

        load();
        return () => { cancelled = true; };
    }, []);

    // Filter data
    const filteredData = useMemo(() => {
        if (!fullData?.features) return null;
        return {
            type: 'FeatureCollection',
            features: fullData.features.filter((f: any) => {
                const type = f.properties?.object_type || 'lake';
                if (!visibleTypes.has(type)) return false;
                if (zoom < 7 && (type === 'river' || type === 'canal')) {
                    return f.properties?.name;
                }
                return true;
            })
        };
    }, [fullData, visibleTypes, zoom]);

    // Enable editing on selected layer
    useEffect(() => {
        if (!geoJsonRef.current) return;

        // Disable previous editing
        if (editLayerRef.current && (editLayerRef.current as any).editing) {
            (editLayerRef.current as any).editing.disable();
            editLayerRef.current = null;
        }

        if (activeTool === 'pencil' && selectedId) {
            geoJsonRef.current.eachLayer((layer: any) => {
                const id = layer.feature?.properties?.id || layer.feature?.properties?.osm_id;
                if (id === selectedId && layer.editing) {
                    layer.editing.enable();
                    editLayerRef.current = layer;

                    // Listen for edits
                    layer.on('edit', () => {
                        setHasChanges(true);
                    });
                }
            });
        }
    }, [activeTool, selectedId]);

    // Style features
    const styleFeature = useCallback((f: any) => {
        const id = f?.properties?.id || f?.properties?.osm_id;
        const isSelected = id === selectedId;
        const type = f?.properties?.object_type || 'lake';
        const color = TYPE_COLORS[type] || '#94a3b8';

        return {
            color: isSelected ? (activeTool === 'pencil' ? '#ef4444' : '#f59e0b') : color,
            weight: isSelected ? 4 : 1.5,
            opacity: isSelected ? 1 : 0.6,
            fillOpacity: isSelected ? 0.4 : 0.1
        };
    }, [selectedId, activeTool]);

    const onEachFeature = useCallback((feature: any, layer: L.Layer) => {
        layer.on({
            click: (e: any) => {
                L.DomEvent.stopPropagation(e);
                const id = feature.properties?.id || feature.properties?.osm_id;
                setSelectedId(id);
                if (mapRef.current) {
                    mapRef.current.fitBounds((layer as any).getBounds(), { padding: [100, 100], maxZoom: 12 });
                }
            }
        });

        const name = feature.properties?.name_kz || feature.properties?.name_ru || 'Unnamed';
        layer.bindTooltip(`<b>${name}</b>`, { sticky: true, className: 'map-tooltip' });
    }, []);

    const selectedObject = useMemo(() => {
        if (!selectedId || !fullData?.features) return null;
        return fullData.features.find((f: any) => (f.properties?.id || f.properties?.osm_id) === selectedId);
    }, [fullData, selectedId]);

    const handleSave = async () => {
        setSaving(true);

        // Get edited geometry if any
        if (editLayerRef.current) {
            const edited = (editLayerRef.current as any).toGeoJSON();
            console.log('Edited geometry:', edited);
            // Here you would send to backend API
        }

        await new Promise(r => setTimeout(r, 500));
        setHasChanges(false);
        setSaving(false);
    };

    return (
        <div className="h-[calc(100vh-4rem)] w-full flex bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden">
            {/* Left Toolbar */}
            <div className="w-16 flex flex-col items-center py-6 gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 z-50">
                <div className="p-2.5 bg-primary-600 rounded-xl shadow-lg mb-4"><Droplets className="w-5 h-5 text-white" /></div>

                <ToolBtn active={activeTool === 'pointer'} onClick={() => setActiveTool('pointer')} icon={MousePointer2} tip="Select" />
                <ToolBtn active={activeTool === 'pencil'} onClick={() => setActiveTool('pencil')} icon={Pencil} tip="Edit Vertices" color="red" />

                <div className="w-8 h-px bg-slate-200 dark:bg-slate-700 my-2" />

                <ToolBtn icon={Plus} onClick={() => mapRef.current?.zoomIn()} tip="Zoom In" />
                <ToolBtn icon={Minus} onClick={() => mapRef.current?.zoomOut()} tip="Zoom Out" />
                <ToolBtn icon={Locate} onClick={() => mapRef.current?.setView(KZ_CENTER, 5)} tip="Reset" />

                <div className="w-8 h-px bg-slate-200 dark:bg-slate-700 my-2" />

                <ToolBtn icon={mapTheme === 'dark' ? Sun : Moon} onClick={() => setMapTheme(t => t === 'dark' ? 'light' : 'dark')} tip="Theme" />

                <div className="flex-1" />

                <button onClick={handleSave} disabled={!hasChanges} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${hasChanges ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                </button>
            </div>

            {/* Map */}
            <div className="flex-1 relative">
                {/* Top Bar */}
                <div className="absolute top-4 left-4 right-4 flex items-center gap-4 z-[1000] pointer-events-none">
                    <div className="w-72 pointer-events-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl flex items-center px-4 py-2">
                        <Search className="w-4 h-4 text-slate-400" />
                        <input type="text" placeholder="Search..." className="bg-transparent border-none focus:ring-0 text-sm w-full ml-2" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    </div>
                    <div className="flex-1" />
                    <div className="pointer-events-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2 shadow-xl flex items-center gap-3 text-xs font-medium">
                        {fromCache && <span className="text-emerald-500 flex items-center gap-1"><Zap className="w-3.5 h-3.5" />Cached</span>}
                        <span className="text-primary-500">{filteredData?.features?.length || 0} objects</span>
                        {hasChanges && <span className="text-amber-500">• Unsaved</span>}
                    </div>
                </div>

                {/* Layer Panel */}
                <div className="absolute bottom-6 left-4 z-[1000]">
                    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl p-2 shadow-xl">
                        {Object.entries(TYPE_COLORS).map(([type, color]) => {
                            const on = visibleTypes.has(type);
                            return (
                                <button key={type} onClick={() => setVisibleTypes(p => { const n = new Set(p); n.has(type) ? n.delete(type) : n.add(type); return n; })} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all text-xs ${on ? 'bg-slate-100 dark:bg-slate-800' : 'opacity-40'}`}>
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                                    <span className="capitalize">{type}</span>
                                    {on ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <MapContainer center={KZ_CENTER} zoom={5} className="h-full w-full" zoomControl={false} preferCanvas>
                    <MapEvents onLoad={m => { mapRef.current = m; m.on('zoomend', () => setZoom(m.getZoom())); }} />
                    <MapBaseLayer theme={mapTheme} />
                    {filteredData && (
                        <GeoJSON
                            key={`geo-${visibleTypes.size}-${zoom < 7}`}
                            ref={geoJsonRef as any}
                            data={filteredData}
                            style={styleFeature}
                            onEachFeature={onEachFeature}
                        />
                    )}
                </MapContainer>
            </div>

            {/* Right Panel */}
            <div className={`bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl transition-all duration-300 z-50 overflow-hidden ${selectedId ? 'w-80' : 'w-0'}`}>
                {selectedObject && (
                    <div className="w-80 h-full flex flex-col p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold">Properties</h2>
                            <button onClick={() => setSelectedId(null)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>

                        {activeTool === 'pencil' && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
                                Edit mode active. Drag vertices to modify geometry.
                            </div>
                        )}

                        <div className="flex-1 space-y-4 overflow-y-auto">
                            <Field label="Type" value={selectedObject.properties.object_type} />
                            <Field label="Name (KZ)" value={selectedObject.properties.name_kz} editable onChange={() => setHasChanges(true)} />
                            <Field label="Name (RU)" value={selectedObject.properties.name_ru} editable onChange={() => setHasChanges(true)} />
                            <Field label="OSM ID" value={selectedObject.properties.osm_id} />
                        </div>

                        <button onClick={handleSave} disabled={!hasChanges} className={`w-full py-3 rounded-xl font-medium transition-all mt-4 ${hasChanges ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                            {hasChanges ? 'Save Changes' : 'No Changes'}
                        </button>
                    </div>
                )}
            </div>

            {loading && (
                <div className="absolute inset-0 bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm z-[2000] flex flex-col items-center justify-center">
                    <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-3" />
                    <p className="font-medium">{fromCache ? 'Loading from cache...' : 'Loading data...'}</p>
                </div>
            )}

            <style>{`
                .map-tooltip { background: rgba(15,23,42,0.9) !important; border: none !important; border-radius: 8px !important; color: white !important; padding: 6px 10px !important; }
                .leaflet-editing-icon { background: #ef4444 !important; border: 2px solid white !important; border-radius: 50% !important; width: 10px !important; height: 10px !important; margin: -5px 0 0 -5px !important; }
            `}</style>
        </div>
    );
}

function ToolBtn({ active, icon: Icon, onClick, tip, color }: any) {
    const colors = { red: 'bg-red-500 text-white shadow-red-500/30', primary: 'bg-primary-600 text-white shadow-primary-500/30' };
    return (
        <button onClick={onClick} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all group relative ${active ? (colors[color as keyof typeof colors] || colors.primary) + ' shadow-lg' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
            <Icon className="w-5 h-5" />
            <div className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[3000]">{tip}</div>
        </button>
    );
}

function Field({ label, value, editable, onChange }: any) {
    return (
        <div>
            <label className="text-xs font-medium text-slate-400 uppercase">{label}</label>
            {editable ? (
                <input type="text" defaultValue={value || ''} onChange={onChange} className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm" />
            ) : (
                <div className="mt-1 text-sm font-medium capitalize">{value || '—'}</div>
            )}
        </div>
    );
}
