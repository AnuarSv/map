#!/usr/bin/env node
/**
 * Process downloaded OSM data and convert to GeoJSON
 */

const fs = require('fs');
const path = require('path');

function processOSMData() {
    console.log('Processing OSM data...');

    const riversFile = '/tmp/kz_rivers.json';
    const lakesFile = '/tmp/kz_lakes.json';

    let allElements = [];

    // Load rivers
    if (fs.existsSync(riversFile)) {
        const rivers = JSON.parse(fs.readFileSync(riversFile, 'utf8'));
        console.log(`Rivers: ${rivers.elements.length} elements`);
        allElements = allElements.concat(rivers.elements);
    }

    // Load lakes
    if (fs.existsSync(lakesFile)) {
        const lakes = JSON.parse(fs.readFileSync(lakesFile, 'utf8'));
        console.log(`Lakes: ${lakes.elements.length} elements`);
        allElements = allElements.concat(lakes.elements);
    }

    console.log(`Total elements: ${allElements.length}`);

    // Index nodes
    const nodes = {};
    for (const el of allElements) {
        if (el.type === 'node') {
            nodes[el.id] = [el.lon, el.lat];
        }
    }
    console.log(`Indexed ${Object.keys(nodes).length} nodes`);

    // Process ways into features
    const features = [];
    const seenWays = new Set();

    for (const el of allElements) {
        if (el.type === 'way' && el.tags && el.nodes && !seenWays.has(el.id)) {
            seenWays.add(el.id);

            const coords = el.nodes.map(id => nodes[id]).filter(Boolean);
            if (coords.length < 2) continue;

            const isClosed = coords.length > 2 &&
                coords[0][0] === coords[coords.length - 1][0] &&
                coords[0][1] === coords[coords.length - 1][1];

            const objectType = getObjectType(el.tags);
            const isLine = objectType === 'river' || objectType === 'canal';

            features.push({
                type: 'Feature',
                properties: {
                    id: el.id,
                    name_kz: el.tags['name:kk'] || el.tags.name || 'Unnamed',
                    name_ru: el.tags['name:ru'] || el.tags.name || 'Unnamed',
                    name_en: el.tags['name:en'] || '',
                    object_type: objectType,
                    osm_id: el.id
                },
                geometry: (!isLine && isClosed) ? {
                    type: 'Polygon',
                    coordinates: [coords]
                } : {
                    type: 'LineString',
                    coordinates: coords
                }
            });
        }
    }

    console.log(`Created ${features.length} features`);

    // Create GeoJSON
    const geojson = {
        type: 'FeatureCollection',
        metadata: {
            source: 'OpenStreetMap',
            downloaded: new Date().toISOString(),
            total: features.length
        },
        features
    };

    // Save
    const outputDir = path.join(__dirname, '../frontend/public/data');
    fs.mkdirSync(outputDir, { recursive: true });

    const outputPath = path.join(outputDir, 'kazakhstan-water.geojson');
    fs.writeFileSync(outputPath, JSON.stringify(geojson));

    const stats = fs.statSync(outputPath);
    console.log(`\nSaved to: ${outputPath}`);
    console.log(`File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
}

function getObjectType(tags) {
    if (tags.waterway === 'river') return 'river';
    if (tags.waterway === 'canal') return 'canal';
    if (tags.water === 'lake') return 'lake';
    if (tags.water === 'reservoir') return 'reservoir';
    if (tags.natural === 'water') return 'lake';
    return 'lake';
}

processOSMData();
