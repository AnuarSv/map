import { Marker as LeafletMarker } from 'react-leaflet';
import L from 'leaflet';

export type MarkerType = 'river' | 'lake' | 'spring' | 'glacier' | 'reservoir' | 'canal';

const markerColors: Record<MarkerType, string> = {
    river: '#0ea5e9',
    lake: '#06b6d4',
    spring: '#10b981',
    glacier: '#a5f3fc',
    reservoir: '#0284c7',
    canal: '#0891b2',
};

function createMarkerIcon(type: MarkerType, pulse = false, selected = false): L.DivIcon {
    const color = markerColors[type];
    const size = selected ? 40 : 32;
    const innerRadius = selected ? 10 : 8;
    const dotRadius = selected ? 4 : 3;

    const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
      ${pulse ? `
        <circle cx="${size / 2}" cy="${size / 2}" r="${innerRadius}" fill="${color}" opacity="0.3">
          <animate attributeName="r" from="${innerRadius}" to="${size / 2}" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite"/>
        </circle>
      ` : ''}
      ${selected ? `
        <circle cx="${size / 2}" cy="${size / 2}" r="${innerRadius + 4}" fill="none" stroke="${color}" stroke-width="2" opacity="0.5"/>
      ` : ''}
      <circle cx="${size / 2}" cy="${size / 2}" r="${innerRadius}" fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${dotRadius}" fill="white"/>
    </svg>
  `;

    return L.divIcon({
        html: svg,
        className: 'custom-marker',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
}

interface WaterMarkerProps {
    position: [number, number];
    type: MarkerType;
    pulse?: boolean;
    selected?: boolean;
    onClick?: () => void;
}

// Cast Marker to any to avoid react-leaflet v5 type issues
const Marker = LeafletMarker as React.ComponentType<{
    position: [number, number];
    icon?: L.Icon | L.DivIcon;
    eventHandlers?: Record<string, (e: L.LeafletMouseEvent) => void>;
}>;

export function WaterMarker({
    position,
    type,
    pulse = false,
    selected = false,
    onClick
}: WaterMarkerProps) {
    return (
        <Marker
            position={position}
            icon={createMarkerIcon(type, pulse, selected)}
            eventHandlers={{
                click: () => onClick?.(),
            }}
        />
    );
}

// Line marker for rivers/canals
export function createLineStyle(type: MarkerType, selected = false) {
    const color = markerColors[type];
    return {
        color,
        weight: selected ? 4 : 2,
        opacity: selected ? 1 : 0.8,
    };
}

// Polygon style for lakes/reservoirs
export function createPolygonStyle(type: MarkerType, selected = false) {
    const color = markerColors[type];
    return {
        color,
        weight: selected ? 3 : 2,
        fillColor: color,
        fillOpacity: selected ? 0.3 : 0.15,
        opacity: selected ? 1 : 0.8,
    };
}
