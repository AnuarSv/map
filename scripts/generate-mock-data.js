const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, '../frontend/public/data/kazakhstan-water.geojson');

const geojson = {
    type: 'FeatureCollection',
    metadata: {
        source: 'Manual Placeholder Data',
        description: 'Simplified major water bodies for prototype'
    },
    features: [
        // Lake Balkhash (Simplified)
        {
            type: 'Feature',
            properties: {
                id: 'balkhash',
                name_kz: 'Балқаш көлі',
                name_ru: 'Озеро Балхаш',
                name_en: 'Lake Balkhash',
                object_type: 'lake'
            },
            geometry: {
                type: 'Polygon',
                coordinates: [[
                    [73.5, 45.0], [74.0, 45.5], [75.0, 46.0], [76.0, 46.5], [77.0, 46.0], 
                    [78.0, 46.5], [79.0, 46.0], [78.5, 45.5], [77.5, 45.0], [76.5, 45.2],
                    [75.5, 44.8], [74.5, 44.5], [73.5, 45.0]
                ]]
            }
        },
        // Caspian Sea (North East part)
        {
            type: 'Feature',
            properties: {
                id: 'caspian',
                name_kz: 'Каспий теңізі',
                name_ru: 'Каспийское море',
                name_en: 'Caspian Sea',
                object_type: 'lake'
            },
            geometry: {
                type: 'Polygon',
                coordinates: [[
                    [50.0, 44.0], [52.0, 44.5], [53.0, 45.0], [52.0, 46.0], [51.0, 46.5],
                    [50.0, 46.8], [49.0, 46.5], [47.0, 46.0], [47.0, 44.0], [50.0, 44.0]
                ]]
            }
        },
        // Irtysh River (Simplified Line)
        {
            type: 'Feature',
            properties: {
                id: 'irtysh',
                name_kz: 'Ертіс өзені',
                name_ru: 'Река Иртыш',
                name_en: 'Irtysh River',
                object_type: 'river'
            },
            geometry: {
                type: 'LineString',
                coordinates: [
                    [85.0, 47.0], [84.0, 48.0], [82.0, 49.0], [80.0, 50.0], 
                    [78.0, 51.0], [77.0, 52.0], [76.0, 53.0], [74.0, 54.0], [70.0, 55.0]
                ]
            }
        },
        // Ishim River
        {
            type: 'Feature',
            properties: {
                id: 'ishim',
                name_kz: 'Есіл өзені',
                name_ru: 'Река Ишим',
                name_en: 'Ishim River',
                object_type: 'river'
            },
            geometry: {
                type: 'LineString',
                coordinates: [
                    [73.0, 49.0], [72.0, 50.0], [71.4, 51.1], // Astana approx
                    [70.0, 52.0], [69.0, 53.0], [68.0, 54.0], [69.0, 55.0]
                ]
            }
        },
        // Ural River
        {
            type: 'Feature',
            properties: {
                id: 'ural',
                name_kz: 'Жайық өзені',
                name_ru: 'Река Урал',
                name_en: 'Ural River',
                object_type: 'river'
            },
            geometry: {
                type: 'LineString',
                coordinates: [
                    [58.0, 54.0], [57.0, 53.0], [56.0, 52.0], [55.0, 51.0], 
                    [53.0, 50.0], [52.0, 49.0], [51.5, 48.0], [51.5, 47.0]
                ]
            }
        }
    ]
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(geojson, null, 2));
console.log(`Generated mock data at ${outputPath}`);
