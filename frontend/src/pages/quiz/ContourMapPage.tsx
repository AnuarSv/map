import { useState, useRef, useEffect } from 'react';
import { MapContainer as MapContainerOrig, GeoJSON as GeoJSONOrig, TileLayer as TileLayerOrig, FeatureGroup as FeatureGroupOrig } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { Edit3, Download, Trash2, Save, Type, Pointer, Eraser, Map as MapIcon, Layers } from 'lucide-react';
import { EditControl } from "react-leaflet-draw";

const MapContainer = MapContainerOrig as any;
const GeoJSON = GeoJSONOrig as any;
const TileLayer = TileLayerOrig as any;
const FeatureGroup = FeatureGroupOrig as any;

const KZ_CENTER: [number, number] = [48.0, 67.0];

// Custom Blank Style for tiles
const BLANK_TILES = "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png";

export default function ContourMapPage() {
    const [mapName, setMapName] = useState("Моя контурная карта");
    const [outline, setOutline] = useState<any>(null);
    const [activeTool, setActiveTool] = useState<string>("draw");
    const mapRef = useRef<L.Map | null>(null);

    useEffect(() => {
        // Load Kazakhstan outline for reference
        fetch('/data/kazakhstan-regions.geojson')
            .then(res => res.json())
            .then(data => setOutline(data));
    }, []);

    const exportMap = () => {
        // Simple alert for now, in future could use html2canvas or leaflet-image
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

    const [showHints, setShowHints] = useState(true);

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col bg-slate-50 dark:bg-slate-950">
            {/* Header / Toolbar */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between z-50 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg border border-emerald-100 dark:border-emerald-800">
                        <Edit3 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <input
                        value={mapName}
                        onChange={(e) => setMapName(e.target.value)}
                        className="bg-transparent border-none font-bold text-slate-900 dark:text-white focus:ring-0 text-xl w-72 placeholder-slate-400"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowHints(!showHints)}
                        className={`flex items-center gap-2 px-4 py-2.5 font-bold rounded-lg transition-all border ${showHints ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
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
                        className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                    >
                        <Download className="w-4 h-4" /> Экспорт
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all">
                        <Save className="w-4 h-4" /> Сохранить
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Side Tools */}
                <div className="w-20 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col items-center py-6 gap-4 z-50">
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

                {/* Map Area */}
                <div className="flex-1 relative bg-slate-50">
                    <MapContainer
                        center={KZ_CENTER}
                        zoom={5}
                        className="h-full w-full"
                        zoomControl={false}
                        preferCanvas={true}
                        whenCreated={(mapInstance: any) => { mapRef.current = mapInstance; }}
                    >
                        <TileLayer url={BLANK_TILES} attribution="CARTO" />

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

                    {/* Instruction Overlay */}
                    <div className="absolute bottom-6 left-6 z-[1000] max-w-sm">
                        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl">
                            <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                <Edit3 className="w-4 h-4 text-emerald-600" />
                                Инструкция
                            </h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                Используйте инструменты слева для создания своей карты. Вы можете обводить границы, отмечать города и реки. Нажмите на маркер, чтобы добавить подпись.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
