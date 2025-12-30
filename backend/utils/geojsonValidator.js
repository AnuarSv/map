// GeoJSON validation utilities

// Valid geometry types for each water object type
const VALID_GEOMETRY_TYPES = {
    river: ['LineString', 'MultiLineString'],
    canal: ['LineString', 'MultiLineString'],
    lake: ['Polygon', 'MultiPolygon'],
    reservoir: ['Polygon', 'MultiPolygon'],
    glacier: ['Polygon', 'MultiPolygon'],
    spring: ['Point']
};

// Kazakhstan bounding box [minLng, minLat, maxLng, maxLat]
const KZ_BBOX = [46.49, 40.57, 87.36, 55.44];

/**
 * Validates GeoJSON geometry for a water object
 * @param {Object} geojson - GeoJSON object (Feature or Geometry)
 * @param {string} objectType - Type of water object
 * @returns {{ valid: boolean, errors: string[], geometry: Object }}
 */
export function validateGeoJSON(geojson, objectType) {
    const errors = [];

    // 1. Basic structure validation
    if (!geojson || typeof geojson !== 'object') {
        return { valid: false, errors: ['Invalid GeoJSON structure'], geometry: null };
    }

    // 2. Extract geometry (handle both Feature and bare Geometry)
    let geometry;
    if (geojson.type === 'Feature') {
        geometry = geojson.geometry;
    } else if (geojson.type === 'FeatureCollection') {
        if (geojson.features && geojson.features.length > 0) {
            geometry = geojson.features[0].geometry;
        } else {
            return { valid: false, errors: ['FeatureCollection is empty'], geometry: null };
        }
    } else {
        geometry = geojson;
    }

    if (!geometry || !geometry.type || !geometry.coordinates) {
        return { valid: false, errors: ['Missing geometry or coordinates'], geometry: null };
    }

    // 3. Validate geometry type matches object type
    const allowedTypes = VALID_GEOMETRY_TYPES[objectType];
    if (!allowedTypes) {
        errors.push(`Unknown object type: ${objectType}`);
    } else if (!allowedTypes.includes(geometry.type)) {
        errors.push(
            `Invalid geometry type "${geometry.type}" for object type "${objectType}". ` +
            `Allowed: ${allowedTypes.join(', ')}`
        );
    }

    // 4. Validate coordinates structure
    try {
        const coords = flattenCoordinates(geometry.coordinates, geometry.type);

        // Check each coordinate is within Kazakhstan bounds
        let outsideKZ = false;
        for (const [lng, lat] of coords) {
            if (typeof lng !== 'number' || typeof lat !== 'number') {
                errors.push('Coordinates must be numbers');
                break;
            }
            if (lng < KZ_BBOX[0] || lng > KZ_BBOX[2] || lat < KZ_BBOX[1] || lat > KZ_BBOX[3]) {
                outsideKZ = true;
            }
        }

        if (outsideKZ) {
            errors.push('Some coordinates are outside Kazakhstan boundaries');
        }
    } catch (e) {
        errors.push(`Invalid coordinate structure: ${e.message}`);
    }

    return {
        valid: errors.length === 0,
        errors,
        geometry: geometry
    };
}

/**
 * Flatten nested coordinates array to get individual points
 */
function flattenCoordinates(coords, geomType) {
    if (geomType === 'Point') {
        return [coords];
    } else if (geomType === 'LineString' || geomType === 'MultiPoint') {
        return coords;
    } else if (geomType === 'Polygon' || geomType === 'MultiLineString') {
        return coords.flat();
    } else if (geomType === 'MultiPolygon') {
        return coords.flat(2);
    }
    return coords;
}

/**
 * Calculate approximate centroid of geometry (for display purposes)
 */
export function calculateCentroid(geometry) {
    try {
        const coords = flattenCoordinates(geometry.coordinates, geometry.type);
        if (coords.length === 0) return null;

        let sumLng = 0, sumLat = 0;
        for (const [lng, lat] of coords) {
            sumLng += lng;
            sumLat += lat;
        }

        return [sumLng / coords.length, sumLat / coords.length];
    } catch {
        return null;
    }
}

export default { validateGeoJSON, calculateCentroid };
