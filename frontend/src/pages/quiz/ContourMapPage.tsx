import { useState, useRef, useEffect } from 'react';
import { MapContainer as MapContainerOrig, GeoJSON as GeoJSONOrig, TileLayer as TileLayerOrig, FeatureGroup as FeatureGroupOrig } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { Edit3, Download, Trash2, Save, Type, Pointer, Eraser, Map as MapIcon, Layers } from 'lucide-react';
import { EditControl } from "react-leaflet-draw";

const MapContainer = MapContainerOrig as any;
const GeoJSON = GeoJSONOrig as any;
const TileLayer = TileLayerOrig as any;
const FeatureGroup = FeatureGroupOrig as any;

const KZ_CENTER: [number, number] = [48.0, 67.0];

// Custom Tiles
const LIGHT_TILES = "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png";
const DARK_TILES = "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png";

export default function ContourMapPage() {
    const [mapName, setMapName] = useState("Моя контурная карта");
    const [outline, setOutline] = useState<any>(null);
    const [activeTool, setActiveTool] = useState<string>("draw");
    const [isDark, setIsDark] = useState(true);
    const mapRef = useRef<L.Map | null>(null);

    useEffect(() => {
        // Load Kazakhstan outline for reference
        fetch('/data/kazakhstan-regions.geojson')
            .then(res => res.json())
            .then(data => setOutline(data));

        // Check theme
        const checkTheme = () => setIsDark(document.documentElement.classList.contains('dark'));
        checkTheme();
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const exportMap = () => {
        alert("Функция экспорта в PNG будет добавлена в следующем обновлении");
    };

    const handleCreated = (e: any) => {
        const { layerType, layer } = e;
        if (layerType === 'marker') {
            const label = prompt("Введите название объекта:");
            if (label) {
                layer.bindTooltip(label, { permanent: true, direction: 'right' }).openTooltip();
            }
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('mineralType');
        if (!type || !mapRef.current) return;

        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const latlng = mapRef.current.containerPointToLatLng([x, y]);

        const icon = L.icon({
            iconUrl: `/icons/minerals/${type}.svg`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });

        L.marker(latlng, { icon }).addTo(mapRef.current);
    };

    const handleDragOver = (e: React.DragEvent) => e.preventDefault();

    const [showHints, setShowHints] = useState(true);

    const MINERALS = ['oil', 'gas', 'gold', 'iron', 'copper', 'coal', 'uranium', 'polymetals'];

    return (
        <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
            {/* Header / Toolbar */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between z-50 shadow-sm shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg border border-emerald-100 dark:border-emerald-800">
                        <Edit3 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <input
                            value={mapName}
                            onChange={(e) => setMapName(e.target.value)}
                            className="bg-transparent border-none font-bold text-slate-900 dark:text-white focus:ring-0 text-xl w-72 placeholder-slate-400 p-0"
                        />
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Режим редактирования</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowHints(!showHints)}
                        className={`flex items-center gap-2 px-4 py-2 font-bold rounded-lg transition-all border ${showHints ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                    >
                        <Layers className="w-4 h-4" /> {showHints ? 'Скрыть границы' : 'Показать границы'}
                    </button>
                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2" />
                    <button
                        onClick={() => window.location.reload()}
                        className="p-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Очистить всё"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={exportMap}
                        className="flex items-center gap-2 px-5 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                    >
                        <Download className="w-4 h-4" /> Экспорт
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all">
                        <Save className="w-4 h-4" /> Сохранить
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Side Tools */}
                <div className="w-20 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col items-center py-6 gap-4 z-50 shrink-0">
                    <button
                        onClick={() => setActiveTool("pointer")}
                        className={`p-3.5 rounded-xl transition-all ${activeTool === "pointer" ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        title="Выбор"
                    >
                        <Pointer className="w-6 h-6" />
                    </button>
                    <div className="w-10 h-px bg-slate-100 dark:bg-slate-800" />
                    <button
                        onClick={() => setActiveTool("draw")}
                        className={`p-3.5 rounded-xl transition-all ${activeTool === "draw" ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        title="Рисование"
                    >
                        <MapIcon className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => setActiveTool("text")}
                        className={`p-3.5 rounded-xl transition-all ${activeTool === "text" ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        title="Текст"
                    >
                        <Type className="w-6 h-6" />
                    </button>
                    <div className="mt-auto">
                        <button className="p-3.5 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all" title="Стереть">
                            <Eraser className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Minerals Palette */}
                <div className="w-20 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col items-center py-4 gap-2 overflow-y-auto shrink-0">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 rotate-180 text-center" style={{ writingMode: 'vertical-rl' }}>Ресурсы</div>
                    {MINERALS.map(m => (
                        <div
                            key={m}
                            draggable
                            onDragStart={(e) => {
                                e.dataTransfer.setData('mineralType', m);
                                const img = new Image();
                                img.src = `/icons/minerals/${m}.svg`;
                                e.dataTransfer.setDragImage(img, 20, 20);
                            }}
                            className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center cursor-grab active:cursor-grabbing hover:border-emerald-500 transition-colors shadow-sm"
                            title={m}
                        >
                            <img src={`/icons/minerals/${m}.svg`} className="w-8 h-8" alt={m} />
                        </div>
                    ))}
                </div>

                {/* Map Area */}
                <div className="flex-1 relative bg-slate-50">
                    <div
                        className="absolute inset-0 z-0 bg-slate-100 dark:bg-slate-900"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                    >
                        <MapContainer
                            center={KZ_CENTER}
                            zoom={5}
                            className="h-full w-full"
                            zoomControl={false}
                            attributionControl={false}
                            preferCanvas={true}
                            whenCreated={(mapInstance: any) => { mapRef.current = mapInstance; }}
                        >
                            <TileLayer url={isDark ? DARK_TILES : LIGHT_TILES} />

                            {outline && showHints && (
                                <GeoJSON
                                    data={outline}
                                    style={{
                                        color: '#94a3b8',
                                        weight: 1.5,
                                        fillOpacity: 0,
                                        dashArray: '4, 4',
                                        opacity: 0.5
                                    }}
                                    interactive={false}
                                />
                            )}

                            <FeatureGroup>
                                <EditControl
                                    position='topright'
                                    onCreated={handleCreated}
                                    draw={{
                                        rectangle: false,
                                        circle: false,
                                        circlemarker: false,
                                        marker: true,
                                        polyline: { shapeOptions: { color: '#059669', weight: 4 } },
                                        polygon: { shapeOptions: { color: '#059669', weight: 2 } },
                                    }}
                                />
                            </FeatureGroup>
                        </MapContainer>
                    </div>

                    {/* Instruction Overlay */}
                    <div className="absolute bottom-6 left-6 z-[1000] max-w-sm pointer-events-none">
                        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl pointer-events-auto">
                            <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                <Edit3 className="w-4 h-4 text-emerald-600" />
                                Инструкция
                            </h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                Рисуйте границы, отмечайте объекты. Перетаскивайте значки ресурсов из панели слева прямо на карту.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

