#!/usr/bin/env node
/**
 * Download Kazakhstan Water Features from OpenStreetMap
 * 
 * This script queries the Overpass API for rivers, lakes, and reservoirs
 * in Kazakhstan and saves them as GeoJSON.
 */

const fs = require('fs');
const path = require('path');

const OVERPASS_API = 'https://overpass-api.de/api/interpreter';

// Kazakhstan bounding box (approximate)
// [south, west, north, east]
const BBOX = '40.5,46.5,55.5,87.5';

// Query for major water features in Kazakhstan
const OVERPASS_QUERY = `
[out:json][timeout:300];
(
  // Major rivers
  way["waterway"="river"]["name"](${BBOX});
  relation["waterway"="river"]["name"](${BBOX});
  
  // Lakes
  way["natural"="water"]["water"="lake"]["name"](${BBOX});
  relation["natural"="water"]["water"="lake"]["name"](${BBOX});
  
  // Reservoirs
  way["natural"="water"]["water"="reservoir"]["name"](${BBOX});
  relation["natural"="water"]["water"="reservoir"]["name"](${BBOX});
  
  // Large water bodies without specific type
  way["natural"="water"]["name"](${BBOX});
);
out body;
>;
out skel qt;
`;

async function downloadWaterData() {
    console.log('Downloading Kazakhstan water data from OpenStreetMap...');
    console.log('This may take a few minutes...\n');

    try {
        const response = await fetch(OVERPASS_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `data=${encodeURIComponent(OVERPASS_QUERY)}`
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`Received ${data.elements.length} elements from OSM`);

        // Convert OSM data to GeoJSON
        const geojson = osmToGeoJSON(data);
        console.log(`Converted to ${geojson.features.length} GeoJSON features`);

        // Save to file
        const outputPath = path.join(__dirname, '../frontend/public/data/kazakhstan-water.geojson');
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, JSON.stringify(geojson, null, 2));

        console.log(`\nSaved to: ${outputPath}`);
        console.log(`File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);

    } catch (error) {
        console.error('Error downloading data:', error.message);
        process.exit(1);
    }
}

function osmToGeoJSON(osmData) {
    const nodes = {};
    const ways = {};
    const features = [];

    // Index nodes by ID
    for (const el of osmData.elements) {
        if (el.type === 'node') {
            nodes[el.id] = [el.lon, el.lat];
        }
    }

    // Process ways
    for (const el of osmData.elements) {
        if (el.type === 'way' && el.nodes && el.tags) {
            const coords = el.nodes.map(id => nodes[id]).filter(Boolean);
            if (coords.length < 2) continue;

            const isPolygon = coords.length > 2 &&
                coords[0][0] === coords[coords.length - 1][0] &&
                coords[0][1] === coords[coords.length - 1][1];

            const objectType = getObjectType(el.tags);

            features.push({
                type: 'Feature',
                properties: {
                    id: el.id,
                    name_kz: el.tags['name:kk'] || el.tags.name || '',
                    name_ru: el.tags['name:ru'] || el.tags.name || '',
                    name_en: el.tags['name:en'] || el.tags.name || '',
                    object_type: objectType,
                    osm_id: el.id,
                    waterway: el.tags.waterway,
                    natural: el.tags.natural,
                    water: el.tags.water
                },
                geometry: isPolygon && objectType !== 'river' ? {
                    type: 'Polygon',
                    coordinates: [coords]
                } : {
                    type: 'LineString',
                    coordinates: coords
                }
            });
        }
    }

    return {
        type: 'FeatureCollection',
        metadata: {
            source: 'OpenStreetMap via Overpass API',
            downloaded: new Date().toISOString(),
            bbox: BBOX,
            total: features.length
        },
        features
    };
}

function getObjectType(tags) {
    if (tags.waterway === 'river') return 'river';
    if (tags.waterway === 'canal') return 'canal';
    if (tags.water === 'lake') return 'lake';
    if (tags.water === 'reservoir') return 'reservoir';
    if (tags.natural === 'water') return 'lake';
    if (tags.natural === 'glacier') return 'glacier';
    return 'lake';
}

downloadWaterData();
