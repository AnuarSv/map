import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import type { ObjectType } from '../../types/waterObject';
import type { Geometry, FeatureCollection } from 'geojson';

interface DrawingToolsProps {
    objectType: ObjectType;
    onGeometryCreated: (geojson: Geometry | null) => void;
    onGeometryEdited?: (geojson: Geometry) => void;
    existingGeometry?: Geometry | null;
    enabled?: boolean;
}

// Fix for Leaflet.Draw icons in bundled apps
const fixDrawIcons = () => {
    // @ts-expect-error - Leaflet internals
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
};

export default function DrawingTools({
    objectType,
    onGeometryCreated,
    onGeometryEdited,
    existingGeometry,
    enabled = true
}: DrawingToolsProps) {
    const map = useMap();
    // @ts-expect-error - leaflet-draw types
    const drawControlRef = useRef<L.Control.Draw | null>(null);
    const drawnItemsRef = useRef<L.FeatureGroup>(new L.FeatureGroup());

    useEffect(() => {
        fixDrawIcons();
    }, []);

    // Determine allowed draw handlers based on object type
    const getDrawOptions = () => {
        const lineStyle = { color: '#0ea5e9', weight: 3 };
        const polygonStyle = { color: '#06b6d4', fillColor: '#06b6d4', fillOpacity: 0.3 };

        const baseOptions = {
            polyline: false as const,
            polygon: false as const,
            rectangle: false as const,
            circle: false as const,
            circlemarker: false as const,
            marker: false as const
        };

        if (objectType === 'river' || objectType === 'canal') {
            return {
                ...baseOptions,
                polyline: { shapeOptions: lineStyle }
            };
        } else if (objectType === 'spring') {
            return { ...baseOptions, marker: true };
        } else {
            // lake, reservoir, glacier
            return {
                ...baseOptions,
                polygon: { shapeOptions: polygonStyle }
            };
        }
    };

    useEffect(() => {
        if (!enabled) {
            // Clean up if disabled
            if (drawControlRef.current) {
                map.removeControl(drawControlRef.current);
                drawControlRef.current = null;
            }
            return;
        }

        const drawnItems = drawnItemsRef.current;
        drawnItems.clearLayers();
        map.addLayer(drawnItems);

        // Load existing geometry if editing
        if (existingGeometry) {
            try {
                const layer = L.geoJSON(existingGeometry as GeoJSON.GeoJsonObject);
                layer.eachLayer((l: L.Layer) => drawnItems.addLayer(l));

                // Fit map to existing geometry
                const bounds = layer.getBounds();
                if (bounds.isValid()) {
                    map.fitBounds(bounds, { padding: [50, 50] });
                }
            } catch (e) {
                console.error('Failed to load existing geometry:', e);
            }
        }

        // Create draw control
        // @ts-expect-error - leaflet-draw types
        const drawControl = new L.Control.Draw({
            position: 'topleft',
            draw: getDrawOptions(),
            edit: {
                featureGroup: drawnItems,
                remove: true,
                edit: true
            }
        });

        map.addControl(drawControl);
        drawControlRef.current = drawControl;

        // Event handlers
        // @ts-expect-error - leaflet-draw event types
        const handleCreated = (e: L.DrawEvents.Created) => {
            const layer = e.layer;
            drawnItems.clearLayers(); // Only one shape at a time
            drawnItems.addLayer(layer);

            // @ts-expect-error - toGeoJSON exists on drawn layers
            const geojson = layer.toGeoJSON();
            onGeometryCreated(geojson.geometry);
        };

        const handleEdited = () => {
            const geojson = drawnItems.toGeoJSON() as FeatureCollection;
            if (geojson.features.length > 0 && onGeometryEdited) {
                onGeometryEdited(geojson.features[0].geometry);
            }
        };

        const handleDeleted = () => {
            onGeometryCreated(null);
        };

        // @ts-expect-error - leaflet-draw event types
        map.on(L.Draw.Event.CREATED, handleCreated);
        // @ts-expect-error - leaflet-draw event types  
        map.on(L.Draw.Event.EDITED, handleEdited);
        // @ts-expect-error - leaflet-draw event types
        map.on(L.Draw.Event.DELETED, handleDeleted);

        return () => {
            // @ts-expect-error - leaflet-draw event types
            map.off(L.Draw.Event.CREATED, handleCreated);
            // @ts-expect-error - leaflet-draw event types
            map.off(L.Draw.Event.EDITED, handleEdited);
            // @ts-expect-error - leaflet-draw event types
            map.off(L.Draw.Event.DELETED, handleDeleted);

            if (drawControlRef.current) {
                map.removeControl(drawControlRef.current);
                drawControlRef.current = null;
            }
            map.removeLayer(drawnItems);
        };
    }, [map, objectType, enabled, existingGeometry, onGeometryCreated, onGeometryEdited]);

    return null; // This component only adds controls to the map
}
