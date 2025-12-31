import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import { ExpertToolbar, type EditorTool, type LayerType } from '../../components/editor/ExpertToolbar';
import { RightPanel } from '../../components/editor/RightPanel';
import type { WaterObject } from '../../types/waterObject';

// Initial center for Kazakhstan
const kazakhstanCenter: [number, number] = [48.0, 67.0];

// Fix types for react-leaflet components
const AnyMapContainer = MapContainer as any;
const AnyTileLayer = TileLayer as any;
const AnyGeoJSON = GeoJSON as any;

// Map Controls Component
function MapController({ onMapReady }: { onMapReady: (map: any) => void }) {
    const map = useMap();
    useEffect(() => {
        onMapReady(map);
    }, [map, onMapReady]);
    return null;
}

export default function EditorPage() {
    // Map ref
    const mapRef = useRef<any>(null);
    const layerRefs = useRef<Record<string, any>>({});

    // Water data state
    const [waterData, setWaterData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasChanges, setHasChanges] = useState(false);

    // Editor State
    const [activeTool, setActiveTool] = useState<EditorTool>('pointer');
    const [visibleLayers, setVisibleLayers] = useState<LayerType[]>(['river', 'lake', 'reservoir', 'canal', 'glacier', 'spring']);
    const [selectedObjectId, setSelectedObjectId] = useState<number | null>(null);

    // Load real water data from GeoJSON file
    useEffect(() => {
        async function loadWaterData() {
            try {
                setLoading(true);
                const response = await fetch('/data/kazakhstan-water.geojson');
                if (!response.ok) throw new Error('Failed to load water data');
                const data = await response.json();
                setWaterData(data);
                console.log(`Loaded ${data.features?.length || 0} water features`);
            } catch (err: any) {
                console.error('Error loading water data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        loadWaterData();
    }, []);

    // Convert GeoJSON features to WaterObject format
    const allObjects = useMemo<WaterObject[]>(() => {
        if (!waterData?.features) return [];
        return waterData.features.map((f: any, idx: number) => ({
            id: f.properties.id || idx,
            canonical_id: f.properties.osm_id ? `osm-${f.properties.osm_id}` : `osm-${f.properties.id}`,
            version: 1,
            name_kz: f.properties.name_kz || 'Unnamed',
            name_ru: f.properties.name_ru || 'Unnamed',
            name_en: f.properties.name_en || '',
            object_type: f.properties.object_type || 'lake',
            status: 'published',
            created_by: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            geometry: f.geometry
        }));
    }, [waterData]);

    // Filtered by visible layers
    const visibleObjects = useMemo(() => {
        return allObjects.filter(obj => visibleLayers.includes(obj.object_type as LayerType));
    }, [allObjects, visibleLayers]);

    // Selected Object
    const selectedObject = useMemo(() => {
        return allObjects.find(obj => obj.id === selectedObjectId) || null;
    }, [allObjects, selectedObjectId]);

    // Vertex Editing Logic
    useEffect(() => {
        Object.values(layerRefs.current).forEach(layer => {
            if (layer?.eachLayer) {
                layer.eachLayer((l: any) => {
                    if (l.editing) l.editing.disable();
                });
            }
        });

        if (selectedObjectId && activeTool === 'pencil') {
            const layer = layerRefs.current[selectedObjectId];
            if (layer?.eachLayer) {
                layer.eachLayer((l: any) => {
                    if (l.editing) l.editing.enable();
                });
            }
        }
    }, [selectedObjectId, activeTool]);

    // Handlers
    const handleMapReady = useCallback((map: any) => {
        mapRef.current = map;
    }, []);

    const handleLayerToggle = (layer: LayerType) => {
        setVisibleLayers(prev =>
            prev.includes(layer) ? prev.filter(l => l !== layer) : [...prev, layer]
        );
    };

    const handleObjectClick = (obj: WaterObject) => {
        if (activeTool === 'pointer' || activeTool === 'pencil') {
            setSelectedObjectId(obj.id);

            // Fly to object
            if (mapRef.current && obj.geometry) {
                const bounds = getGeometryBounds(obj.geometry);
                if (bounds) {
                    mapRef.current.flyToBounds(bounds, { padding: [50, 50], duration: 0.5 });
                }
            }
        }
    };

    const handleSave = () => {
        console.log('Saving changes...');
        setHasChanges(false);
        // In real app, this would call backend API
    };

    const handlePropertyChange = (data: Partial<WaterObject>) => {
        console.log('Property changed:', data);
        setHasChanges(true);
    };

    const getGeometryBounds = (geometry: any) => {
        if (!geometry?.coordinates) return null;

        let coords: number[][] = [];
        if (geometry.type === 'Polygon') {
            coords = geometry.coordinates[0];
        } else if (geometry.type === 'LineString') {
            coords = geometry.coordinates;
        } else if (geometry.type === 'MultiPolygon') {
            coords = geometry.coordinates.flat(2);
        }

        if (!coords?.length) return null;

        const lats = coords.map((c: number[]) => c[1]);
        const lngs = coords.map((c: number[]) => c[0]);

        return [
            [Math.min(...lats), Math.min(...lngs)],
            [Math.max(...lats), Math.max(...lngs)]
        ];
    };

    const getObjectColor = (obj: WaterObject, isSelected: boolean) => {
        if (isSelected) {
            return activeTool === 'pencil' ? '#ef4444' : '#6366f1';
        }

        switch (obj.object_type) {
            case 'river':
            case 'canal':
                return '#3b82f6';
            case 'lake':
            case 'reservoir':
                return '#0ea5e9';
            case 'glacier':
                return '#a5f3fc';
            case 'spring':
                return '#22d3ee';
            default:
                return '#94a3b8';
        }
    };

    return (
        <div className="h-[calc(100vh-4rem)] w-full bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white flex relative overflow-hidden">
            {/* Main Map Area */}
            <div className={`flex-1 relative transition-all duration-300 ${selectedObject ? 'mr-96' : 'mr-80'}`}>
                {/* Floating Toolbar */}
                <ExpertToolbar
                    activeTool={activeTool}
                    onToolChange={setActiveTool}
                    visibleLayers={visibleLayers}
                    onLayerToggle={handleLayerToggle}
                    onSave={handleSave}
                    canSave={hasChanges}
                    canUndo={false}
                    canRedo={false}
                />

                <AnyMapContainer
                    center={kazakhstanCenter}
                    zoom={5}
                    minZoom={4}
                    maxZoom={18}
                    className="h-full w-full"
                    zoomControl={false}
                    scrollWheelZoom={true}
                >
                    <MapController onMapReady={handleMapReady} />

                    <AnyTileLayer
                        attribution='CARTO'
                        url="https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />

                    {visibleObjects.map(obj => {
                        const isSelected = obj.id === selectedObjectId;
                        const color = getObjectColor(obj, isSelected);

                        return (
                            <AnyGeoJSON
                                key={obj.id}
                                ref={(r: any) => {
                                    if (r) layerRefs.current[obj.id] = r;
                                    else delete layerRefs.current[obj.id];
                                }}
                                data={obj.geometry as GeoJSON.GeoJsonObject}
                                style={() => ({
                                    color: color,
                                    weight: isSelected ? 4 : 2,
                                    opacity: isSelected ? 1 : 0.8,
                                    fillColor: color,
                                    fillOpacity: isSelected ? 0.4 : 0.2
                                })}
                                eventHandlers={{
                                    click: (e: any) => {
                                        e.originalEvent?.stopPropagation?.();
                                        handleObjectClick(obj);
                                    }
                                }}
                            />
                        );
                    })}
                </AnyMapContainer>

                {/* Status Overlay */}
                <div className="absolute top-4 right-4 z-[500] pointer-events-none">
                    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl text-xs shadow-xl">
                        {loading ? (
                            <span className="text-amber-500">Loading water data...</span>
                        ) : error ? (
                            <span className="text-red-500">Error: {error}</span>
                        ) : (
                            <>
                                <span className="text-slate-500 dark:text-slate-400">
                                    {activeTool === 'pointer' ? 'Select Mode' : 'Edit Mode'}
                                </span>
                                <span className="mx-2 text-slate-300 dark:text-slate-600">•</span>
                                <span className="text-primary-500 font-medium">{visibleObjects.length}</span>
                                <span className="text-slate-500 dark:text-slate-400 ml-1">objects</span>
                                {hasChanges && (
                                    <>
                                        <span className="mx-2 text-slate-300 dark:text-slate-600">•</span>
                                        <span className="text-amber-500">Unsaved changes</span>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Persistent Right Panel */}
            <div className={`
                absolute top-0 right-0 h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-[1000] transition-all duration-300
                ${selectedObject ? 'w-96 translate-x-0' : 'w-80 translate-x-0'}
            `}>
                <RightPanel
                    selectedObject={selectedObject}
                    onClose={() => setSelectedObjectId(null)}
                    onSave={handlePropertyChange}
                />
            </div>
        </div>
    );
}
