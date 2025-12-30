import express from 'express';
import pool from '../config/db.js';
import protect from '../middleware/auth.js';
import { requireExpert, requireAdmin } from '../middleware/roles.js';
import { validateGeoJSON } from '../utils/geojsonValidator.js';

const router = express.Router();

// ============================================
// PUBLIC ENDPOINTS (No auth required)
// ============================================

/**
 * GET /api/water-objects
 * Get all published water objects as GeoJSON FeatureCollection
 */
router.get('/', async (req, res) => {
    try {
        const { type } = req.query;

        let query = `
            SELECT 
                id, canonical_id, version, name_kz, name_ru, name_en,
                object_type, geometry, length_km, area_km2, max_depth_m,
                avg_depth_m, water_volume_km3, basin_area_km2, avg_discharge_m3s,
                salinity_level, pollution_index, ecological_status,
                description_kz, description_ru, description_en,
                created_at, published_at
            FROM water_objects 
            WHERE status = 'published'
        `;
        const params = [];

        if (type) {
            params.push(type);
            query += ` AND object_type = $${params.length}`;
        }

        query += ' ORDER BY name_kz';

        const result = await pool.query(query, params);

        // Format as GeoJSON FeatureCollection
        const features = result.rows.map(row => ({
            type: 'Feature',
            id: row.canonical_id,
            geometry: row.geometry,
            properties: {
                id: row.id,
                canonical_id: row.canonical_id,
                version: row.version,
                name_kz: row.name_kz,
                name_ru: row.name_ru,
                name_en: row.name_en,
                object_type: row.object_type,
                length_km: row.length_km,
                area_km2: row.area_km2,
                max_depth_m: row.max_depth_m,
                avg_depth_m: row.avg_depth_m,
                water_volume_km3: row.water_volume_km3,
                basin_area_km2: row.basin_area_km2,
                avg_discharge_m3s: row.avg_discharge_m3s,
                salinity_level: row.salinity_level,
                pollution_index: row.pollution_index,
                ecological_status: row.ecological_status,
                description_kz: row.description_kz,
                description_ru: row.description_ru,
                description_en: row.description_en,
                published_at: row.published_at
            }
        }));

        res.json({
            type: 'FeatureCollection',
            features,
            metadata: {
                total: features.length,
                fetched_at: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Get water objects error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * GET /api/water-objects/:canonicalId
 * Get a specific published water object by canonical ID
 */
router.get('/:canonicalId', async (req, res) => {
    try {
        const { canonicalId } = req.params;

        const result = await pool.query(`
            SELECT * FROM water_objects 
            WHERE canonical_id = $1 AND status = 'published'
        `, [canonicalId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Water object not found' });
        }

        const row = result.rows[0];
        res.json({
            type: 'Feature',
            id: row.canonical_id,
            geometry: row.geometry,
            properties: { ...row, geometry: undefined }
        });
    } catch (error) {
        console.error('Get water object error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * GET /api/water-objects/:canonicalId/history
 * Get version history for a water object (requires authentication)
 */
router.get('/:canonicalId/history', protect, async (req, res) => {
    try {
        const { canonicalId } = req.params;

        const result = await pool.query(`
            SELECT 
                wo.id, wo.version, wo.status, wo.created_at, wo.published_at,
                u.name as created_by_name
            FROM water_objects wo
            JOIN users u ON wo.created_by = u.id
            WHERE wo.canonical_id = $1
            ORDER BY wo.version DESC
        `, [canonicalId]);

        res.json({ history: result.rows });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ============================================
// EXPERT ENDPOINTS (Requires expert or admin role)
// ============================================

/**
 * GET /api/water-objects/my/drafts
 * Get current user's drafts and pending submissions
 */
router.get('/my/drafts', protect, requireExpert, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * FROM water_objects 
            WHERE created_by = $1 AND status IN ('draft', 'pending', 'rejected')
            ORDER BY updated_at DESC
        `, [req.user.id]);

        res.json({ drafts: result.rows });
    } catch (error) {
        console.error('Get drafts error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * POST /api/water-objects
 * Create a new water object draft
 */
router.post('/', protect, requireExpert, async (req, res) => {
    const {
        name_kz, name_ru, name_en,
        object_type, geometry,
        length_km, area_km2, max_depth_m, avg_depth_m,
        water_volume_km3, basin_area_km2, avg_discharge_m3s,
        salinity_level, pollution_index, ecological_status,
        description_kz, description_ru, description_en,
        historical_notes, sources
    } = req.body;

    // Validate required fields
    if (!name_kz || !object_type || !geometry) {
        return res.status(400).json({
            message: 'name_kz, object_type, and geometry are required'
        });
    }

    // Validate GeoJSON
    const validation = validateGeoJSON(geometry, object_type);
    if (!validation.valid) {
        return res.status(400).json({
            message: 'Invalid geometry',
            errors: validation.errors
        });
    }

    try {
        const result = await pool.query(`
            INSERT INTO water_objects (
                name_kz, name_ru, name_en, object_type, geometry,
                length_km, area_km2, max_depth_m, avg_depth_m,
                water_volume_km3, basin_area_km2, avg_discharge_m3s,
                salinity_level, pollution_index, ecological_status,
                description_kz, description_ru, description_en,
                historical_notes, sources,
                status, created_by
            ) VALUES (
                $1, $2, $3, $4, $5,
                $6, $7, $8, $9,
                $10, $11, $12,
                $13, $14, $15,
                $16, $17, $18,
                $19, $20,
                'draft', $21
            ) RETURNING id, canonical_id, version
        `, [
            name_kz, name_ru, name_en, object_type,
            JSON.stringify(validation.geometry),
            length_km, area_km2, max_depth_m, avg_depth_m,
            water_volume_km3, basin_area_km2, avg_discharge_m3s,
            salinity_level, pollution_index, ecological_status,
            description_kz, description_ru, description_en,
            historical_notes, JSON.stringify(sources || []),
            req.user.id
        ]);

        // Log the creation
        await pool.query(`
            INSERT INTO change_logs (water_object_id, canonical_id, action, performed_by)
            VALUES ($1, $2, 'create', $3)
        `, [result.rows[0].id, result.rows[0].canonical_id, req.user.id]);

        res.status(201).json({
            message: 'Draft created successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Create water object error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * PUT /api/water-objects/:id
 * Update a draft water object (only owner can update their drafts)
 */
router.put('/:id', protect, requireExpert, async (req, res) => {
    const { id } = req.params;

    try {
        // Check ownership and status
        const existing = await pool.query(
            'SELECT * FROM water_objects WHERE id = $1',
            [id]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({ message: 'Water object not found' });
        }

        const waterObject = existing.rows[0];

        // Only allow editing drafts or rejected items
        if (!['draft', 'rejected'].includes(waterObject.status)) {
            return res.status(400).json({
                message: 'Can only edit drafts or rejected submissions'
            });
        }

        // Only owner can edit (unless admin)
        if (waterObject.created_by !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to edit this object' });
        }

        const {
            name_kz, name_ru, name_en, geometry,
            length_km, area_km2, max_depth_m, avg_depth_m,
            water_volume_km3, basin_area_km2, avg_discharge_m3s,
            salinity_level, pollution_index, ecological_status,
            description_kz, description_ru, description_en,
            historical_notes, sources
        } = req.body;

        // Validate geometry if provided
        if (geometry) {
            const validation = validateGeoJSON(geometry, waterObject.object_type);
            if (!validation.valid) {
                return res.status(400).json({
                    message: 'Invalid geometry',
                    errors: validation.errors
                });
            }
        }

        const result = await pool.query(`
            UPDATE water_objects SET
                name_kz = COALESCE($1, name_kz),
                name_ru = COALESCE($2, name_ru),
                name_en = COALESCE($3, name_en),
                geometry = COALESCE($4, geometry),
                length_km = COALESCE($5, length_km),
                area_km2 = COALESCE($6, area_km2),
                max_depth_m = COALESCE($7, max_depth_m),
                avg_depth_m = COALESCE($8, avg_depth_m),
                water_volume_km3 = COALESCE($9, water_volume_km3),
                basin_area_km2 = COALESCE($10, basin_area_km2),
                avg_discharge_m3s = COALESCE($11, avg_discharge_m3s),
                salinity_level = COALESCE($12, salinity_level),
                pollution_index = COALESCE($13, pollution_index),
                ecological_status = COALESCE($14, ecological_status),
                description_kz = COALESCE($15, description_kz),
                description_ru = COALESCE($16, description_ru),
                description_en = COALESCE($17, description_en),
                historical_notes = COALESCE($18, historical_notes),
                sources = COALESCE($19, sources),
                updated_by = $20,
                status = 'draft'
            WHERE id = $21
            RETURNING *
        `, [
            name_kz, name_ru, name_en,
            geometry ? JSON.stringify(geometry) : null,
            length_km, area_km2, max_depth_m, avg_depth_m,
            water_volume_km3, basin_area_km2, avg_discharge_m3s,
            salinity_level, pollution_index, ecological_status,
            description_kz, description_ru, description_en,
            historical_notes, sources ? JSON.stringify(sources) : null,
            req.user.id, id
        ]);

        // Log the update
        await pool.query(`
            INSERT INTO change_logs (water_object_id, canonical_id, action, performed_by)
            VALUES ($1, $2, 'update', $3)
        `, [id, waterObject.canonical_id, req.user.id]);

        res.json({
            message: 'Draft updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update water object error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * POST /api/water-objects/:id/submit
 * Submit a draft for admin review
 */
router.post('/:id/submit', protect, requireExpert, async (req, res) => {
    const { id } = req.params;

    try {
        // Check ownership and status
        const existing = await pool.query(
            'SELECT * FROM water_objects WHERE id = $1',
            [id]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({ message: 'Water object not found' });
        }

        const waterObject = existing.rows[0];

        if (!['draft', 'rejected'].includes(waterObject.status)) {
            return res.status(400).json({
                message: 'Can only submit drafts or rejected items for review'
            });
        }

        if (waterObject.created_by !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to submit this object' });
        }

        // Update status to pending
        await pool.query(`
            UPDATE water_objects 
            SET status = 'pending', rejection_reason = NULL
            WHERE id = $1
        `, [id]);

        // Log the submission
        await pool.query(`
            INSERT INTO change_logs (water_object_id, canonical_id, action, performed_by)
            VALUES ($1, $2, 'submit', $3)
        `, [id, waterObject.canonical_id, req.user.id]);

        res.json({ message: 'Submitted for review successfully' });
    } catch (error) {
        console.error('Submit water object error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * DELETE /api/water-objects/:id
 * Delete a draft (only owner can delete their drafts)
 */
router.delete('/:id', protect, requireExpert, async (req, res) => {
    const { id } = req.params;

    try {
        // Check ownership and status
        const existing = await pool.query(
            'SELECT * FROM water_objects WHERE id = $1',
            [id]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({ message: 'Water object not found' });
        }

        const waterObject = existing.rows[0];

        if (waterObject.status === 'published') {
            return res.status(400).json({
                message: 'Cannot delete published objects'
            });
        }

        if (waterObject.created_by !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this object' });
        }

        await pool.query('DELETE FROM water_objects WHERE id = $1', [id]);

        res.json({ message: 'Draft deleted successfully' });
    } catch (error) {
        console.error('Delete water object error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
