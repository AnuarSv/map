import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { X, ExternalLink } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const kazakhstanCenter: [number, number] = [48.0, 67.0];

// Fix for react-leaflet v5
const AnyMapContainer = MapContainer as any;
const AnyTileLayer = TileLayer as any;
const AnyGeoJSON = GeoJSON as any;

export default function PublicMapPage() {
    const [waterData, setWaterData] = useState<any>(null);
    const [regionsData, setRegionsData] = useState<any>(null);
    const [citiesData, setCitiesData] = useState<any>(null);
    const [mineralsData, setMineralsData] = useState<any>(null);
    const [selectedObject, setSelectedObject] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [water, regions, cities, minerals] = await Promise.all([
                    fetch('/data/kazakhstan-water.geojson').then(res => res.json()),
                    fetch('/data/kazakhstan-regions.geojson').then(res => res.json()),
                    fetch('/data/kazakhstan-cities.geojson').then(res => res.json()),
                    fetch('/data/kazakhstan-minerals.geojson').then(res => res.json())
                ]);
                setWaterData(water);
                setRegionsData(regions);
                setCitiesData(cities);
                setMineralsData(minerals);
            } catch (error) {
                console.error('Error loading map data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const waterObjectsCount = useMemo(() => {
        if (!waterData?.features) return 0;
        return waterData.features.length;
    }, [waterData]);

    const getColor = (type: string) => {
        switch (type) {
            case 'river':
            case 'canal':
                return '#3b82f6';
            case 'lake':
            case 'reservoir':
                return '#0ea5e9';
            default:
                return '#6366f1';
        }
    };

    return (
        <div className="h-[calc(100vh-4rem)] w-full bg-slate-100 dark:bg-slate-950 relative">
            <AnyMapContainer
                center={kazakhstanCenter}
                zoom={5}
                className="h-full w-full"
                zoomControl={false}
                preferCanvas={true}
            >
                <AnyTileLayer
                    attribution='CARTO'
                    url="https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {regionsData && (
                    <AnyGeoJSON
                        data={regionsData}
                        style={{
                            color: '#64748b',
                            weight: 1,
                            fillOpacity: 0.1,
                            dashArray: '3'
                        }}
                    />
                )}

                {waterData && (
                    <AnyGeoJSON
                        data={waterData}
                        style={(feature: any) => ({
                            color: getColor(feature?.properties?.object_type),
                            weight: 2,
                            opacity: 0.8,
                            fillOpacity: 0.3
                        })}
                        onEachFeature={(feature: any, layer: any) => {
                            layer.on({
                                click: () => {
                                    const props = feature.properties;
                                    setSelectedObject({
                                        id: props.id || props.osm_id,
                                        canonical_id: props.osm_id ? `osm-${props.osm_id}` : `osm-${props.id}`,
                                        name_kz: props.name_kz || 'Unnamed',
                                        name_ru: props.name_ru || 'Unnamed',
                                        name_en: props.name_en || '',
                                        object_type: props.object_type || 'lake',
                                        geometry: feature.geometry
                                    });
                                }
                            });
                        }}
                    />
                )}

                {citiesData && (
                    <AnyGeoJSON
                        data={citiesData}
                        pointToLayer={(feature: any, latlng: any) => {
                            return L.circleMarker(latlng, {
                                radius: feature.properties.is_capital ? 6 : 4,
                                fillColor: "#ffffff",
                                color: "#000000",
                                weight: 2,
                                opacity: 1,
                                fillOpacity: 1
                            }).bindTooltip(feature.properties.name_ru, {
                                permanent: true,
                                direction: 'top',
                                className: 'city-label'
                            });
                        }}
                    />
                )}

                {mineralsData && (
                    <AnyGeoJSON
                        data={mineralsData}
                        pointToLayer={(feature: any, latlng: any) => {
                            return L.circleMarker(latlng, {
                                radius: 4,
                                fillColor: "#eab308",
                                color: "#854d0e",
                                weight: 1,
                                opacity: 1,
                                fillOpacity: 0.8
                            }).bindTooltip(feature.properties.name_ru, {
                                permanent: false,
                                direction: 'top'
                            });
                        }}
                    />
                )}
            </AnyMapContainer>

            {/* Overlay Header */}
            <div className="absolute top-4 left-4 z-[1000]">
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl shadow-lg">
                    <h1 className="text-slate-900 dark:text-white font-bold">География Казахстана</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">
                        {loading ? 'Загрузка...' : `${regionsData?.features?.length || 0} областей, ${citiesData?.features?.length || 0} городов, ${waterObjectsCount} водных объектов`}
                    </p>
                </div>
            </div>

            {/* Legend */}
            <div className="absolute top-4 right-4 z-[1000]">
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl shadow-lg">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Легенда</h3>
                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-white border-2 border-black rounded-full" />
                            <span>Города</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500/30 border border-blue-500 rounded" />
                            <span>Водные объекты</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-yellow-500/80 border border-yellow-700 rounded-full" />
                            <span>Минералы</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Object Detail Popup */}
            {selectedObject && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-md px-4">
                    <div className="bg-white dark:bg-slate-900 backdrop-blur-md border border-slate-200 dark:border-slate-700 p-5 rounded-2xl shadow-2xl relative">
                        <button
                            onClick={() => setSelectedObject(null)}
                            className="absolute top-3 right-3 text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                            {selectedObject.name_kz}
                        </h2>

                        <div className="flex gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3">
                            <span className="capitalize px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                                {selectedObject.object_type}
                            </span>
                            <span>{selectedObject.name_ru}</span>
                        </div>

                        <div className="flex items-center gap-4 border-t border-slate-200 dark:border-slate-700 pt-3 mt-3">
                            <a
                                href={`https://www.openstreetmap.org/way/${selectedObject.canonical_id?.split('-')[1]}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-500 text-sm flex items-center gap-1 hover:underline"
                            >
                                OpenStreetMap <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
