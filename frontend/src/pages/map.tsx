import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useEffect, useMemo } from 'react';
import type { WaterObject } from '../types/waterObject';
import { X, ExternalLink } from 'lucide-react';

const kazakhstanCenter: [number, number] = [48.0, 67.0];

// Fix for react-leaflet v5
const AnyMapContainer = MapContainer as any;
const AnyTileLayer = TileLayer as any;
const AnyGeoJSON = GeoJSON as any;

export default function PublicMapPage() {
    const [waterData, setWaterData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedObject, setSelectedObject] = useState<WaterObject | null>(null);

    // Load water data
    useEffect(() => {
        async function loadData() {
            try {
                const res = await fetch('/data/kazakhstan-water.geojson');
                if (res.ok) {
                    const data = await res.json();
                    setWaterData(data);
                }
            } catch (err) {
                console.error('Failed to load water data:', err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const waterObjects = useMemo<WaterObject[]>(() => {
        if (!waterData?.features) return [];
        return waterData.features.map((f: any, idx: number) => ({
            id: f.properties.id || idx,
            canonical_id: f.properties.osm_id ? `osm-${f.properties.osm_id}` : `osm-${f.properties.id}`,
            name_kz: f.properties.name_kz || 'Unnamed',
            name_ru: f.properties.name_ru || 'Unnamed',
            name_en: f.properties.name_en || '',
            object_type: f.properties.object_type || 'lake',
            geometry: f.geometry
        }));
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
            >
                <AnyTileLayer
                    attribution='CARTO'
                    url="https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {waterObjects.map(obj => (
                    <AnyGeoJSON
                        key={obj.id}
                        data={obj.geometry}
                        style={{
                            color: getColor(obj.object_type),
                            weight: 2,
                            opacity: 0.8,
                            fillOpacity: 0.3
                        }}
                        eventHandlers={{
                            click: () => setSelectedObject(obj)
                        }}
                    />
                ))}
            </AnyMapContainer>

            {/* Overlay Header */}
            <div className="absolute top-4 left-4 z-[1000]">
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl shadow-lg">
                    <h1 className="text-slate-900 dark:text-white font-bold">WaterMap Public</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">
                        {loading ? 'Loading...' : `${waterObjects.length} water objects`}
                    </p>
                </div>
            </div>

            {/* Legend */}
            <div className="absolute top-4 right-4 z-[1000]">
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl shadow-lg">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Legend</h3>
                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-0.5 bg-blue-500 rounded" />
                            <span>Rivers</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-cyan-500/30 border border-cyan-500 rounded" />
                            <span>Lakes</span>
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
                                href={`https://www.openstreetmap.org/way/${selectedObject.canonical_id?.replace('osm-', '')}`}
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
