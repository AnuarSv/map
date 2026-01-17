#!/usr/bin/env node
/**
 * Smart Download of Major Water Features
 * Targets specific key regions to ensure reliability and speed.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const OUTPUT_PATH = path.join(__dirname, '../frontend/public/data/kazakhstan-water.geojson');
const TMP_DIR = path.join(__dirname, 'tmp_chunks');

// Ensure tmp dir exists
if (!fs.existsSync(TMP_DIR)) {
    fs.mkdirSync(TMP_DIR, { recursive: true });
}

function queryOverpass(query) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'overpass-api.de',
            path: '/api/interpreter',
            method: 'POST',
            timeout: 30000, // 30s client timeout
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'WaterMap-Downloader/1.0'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 429) {
                    reject(new Error('Rate Limited (429)'));
                } else if (res.statusCode !== 200) {
                    reject(new Error(`Status ${res.statusCode}: ${data.substring(0, 100)}`));
                } else {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(new Error('Invalid JSON'));
                    }
                }
            });
        });
        
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Client Timeout (30s)'));
        });
        
        req.on('error', (e) => reject(new Error(e.message)));
        req.write(`data=${encodeURIComponent(query)}`);
        req.end();
    });
}

function generateKeyRegions() {
    return [
        // Caspian Sea
        { id: 'caspian_north', bbox: '44.0,46.5,47.0,53.0', desc: 'Caspian Sea (North)' },
        { id: 'caspian_east', bbox: '43.0,50.0,45.0,54.0', desc: 'Caspian Sea (East)' },
        
        // Lake Balkhash
        { id: 'balkhash_west', bbox: '45.0,73.0,46.5,76.0', desc: 'Lake Balkhash (West)' },
        { id: 'balkhash_east', bbox: '46.0,76.0,47.0,79.5', desc: 'Lake Balkhash (East)' },
        
        // Alakol
        { id: 'alakol', bbox: '45.5,80.5,46.5,82.5', desc: 'Alakol Lakes' },
        
        // Kapchagay
        { id: 'kapchagay', bbox: '43.5,77.0,44.2,78.5', desc: 'Kapchagay Reservoir' },
        
        // Major Rivers
        { id: 'irtysh_pavlodar', bbox: '52.0,76.0,53.0,77.5', desc: 'Irtysh (Pavlodar)' },
        { id: 'irtysh_oskemen', bbox: '49.5,82.0,50.5,83.0', desc: 'Irtysh (Oskemen)' },
        { id: 'ural_atyrau', bbox: '46.5,51.0,47.5,52.0', desc: 'Ural (Atyrau)' },
        { id: 'ural_uralsk', bbox: '51.0,51.0,51.5,51.5', desc: 'Ural (Uralsk)' },
        { id: 'ishim_astana', bbox: '51.0,71.0,51.5,71.8', desc: 'Ishim (Astana)' },
        { id: 'tobol_kostanay', bbox: '53.0,63.0,53.5,64.0', desc: 'Tobol (Kostanay)' },
        
        // Aral Sea
        { id: 'aral_sea', bbox: '45.5,59.0,47.0,62.0', desc: 'North Aral Sea' },
        
        // Bukhtarma
        { id: 'bukhtarma', bbox: '49.0,83.0,49.8,85.0', desc: 'Bukhtarma Reservoir' },
        
        // Shardara
        { id: 'shardara', bbox: '40.8,67.5,41.5,68.5', desc: 'Shardara Reservoir' }
    ];
}

async function downloadChunk(chunk, retries = 3) {
    const cacheFile = path.join(TMP_DIR, `${chunk.id}.json`);
    
    if (fs.existsSync(cacheFile)) {
        console.log(`Skipping ${chunk.desc} (already exists)`);
        return JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    }

    console.log(`Downloading ${chunk.desc} ...`);

    const query = `
        [out:json][timeout:180];
        (
            way["waterway"~"river|canal|stream"]["name"](${chunk.bbox});
            way["natural"="water"]["name"](${chunk.bbox});
            relation["natural"="water"]["name"](${chunk.bbox});
        );
        out geom;
    `;

    try {
        const data = await queryOverpass(query);
        fs.writeFileSync(cacheFile, JSON.stringify(data));
        return data;
    } catch (e) {
        if (retries > 0) {
            const delay = e.message.includes('429') ? 10000 : 3000;
            console.log(`  Error ${chunk.desc}: ${e.message}. Retrying...`);
            await new Promise(r => setTimeout(r, delay));
            return downloadChunk(chunk, retries - 1);
        }
        console.error(`  FAILED ${chunk.desc}: ${e.message}`);
        return { elements: [] };
    }
}

function processElements(elements) {
    const features = [];
    const seen = new Set();

    for (const el of elements) {
        if (seen.has(el.id)) continue;
        seen.add(el.id);

        if (!el.tags || !el.tags.name) continue;

        let geometry = null;
        let type = 'LineString';

        if (el.geometry) {
            const coords = el.geometry.map(p => [p.lon, p.lat]);
            
            if (coords.some(p => isNaN(p[0]) || isNaN(p[1]))) continue;

            const isClosed = coords.length > 2 && 
                coords[0][0] === coords[coords.length-1][0] && 
                coords[0][1] === coords[coords.length-1][1];
                
            const isWaterArea = el.tags.natural === 'water' || el.tags.water;
            
            if (isWaterArea && isClosed) {
                type = 'Polygon';
                geometry = { type: 'Polygon', coordinates: [coords] };
            } else {
                geometry = { type: 'LineString', coordinates: coords };
            }
        }

        if (geometry) {
            features.push({
                type: 'Feature',
                properties: {
                    id: el.id,
                    osm_id: el.id,
                    name_kz: el.tags['name:kk'] || el.tags.name,
                    name_ru: el.tags['name:ru'] || el.tags.name,
                    name_en: el.tags['name:en'] || '',
                    object_type: el.tags.waterway === 'river' ? 'river' : 'lake'
                },
                geometry: geometry
            });
        }
    }
    return features;
}

async function main() {
    try {
        const chunks = generateKeyRegions();
        console.log(`Targeting ${chunks.length} key water regions.`);
        
        let allElements = [];
        
        for (let i = 0; i < chunks.length; i++) {
            const result = await downloadChunk(chunks[i]);
            if (result.elements) {
                allElements = allElements.concat(result.elements);
            }
            
            console.log(`Progress: ${i+1}/${chunks.length} | Total Elements: ${allElements.length}`);
            await new Promise(r => setTimeout(r, 1000));
        }
        
        console.log(`\nProcessing ${allElements.length} elements...`);
        
        const uniqueElements = Array.from(new Map(allElements.map(item => [item.id, item])).values());
        const features = processElements(uniqueElements);
        console.log(`Generated ${features.length} GeoJSON features.`);

        const geojson = {
            type: 'FeatureCollection',
            metadata: {
                generated: new Date().toISOString(),
                count: features.length
            },
            features: features
        };

        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(geojson));
        console.log(`SUCCESS! Saved to ${OUTPUT_PATH}`);
        
    } catch (err) {
        console.error('FATAL ERROR:', err);
        process.exit(1);
    }
}

main();