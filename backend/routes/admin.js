import express from 'express';
import pool from '../config/db.js';
import protect from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roles.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(requireAdmin);

// ============================================
// PENDING REVIEWS
// ============================================

/**
 * GET /api/admin/pending
 * Get all pending water object submissions
 */
router.get('/pending', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                wo.*,
                u.name as submitted_by_name,
                u.email as submitted_by_email
            FROM water_objects wo
            JOIN users u ON wo.created_by = u.id
            WHERE wo.status = 'pending'
            ORDER BY wo.updated_at ASC
        `);

        res.json({ pending: result.rows });
    } catch (error) {
        console.error('Get pending error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * GET /api/admin/pending/:id/diff
 * Get diff between pending version and current published version
 */
router.get('/pending/:id/diff', async (req, res) => {
    const { id } = req.params;

    try {
        // Get the pending object
        const pendingResult = await pool.query(
            'SELECT * FROM water_objects WHERE id = $1 AND status = $2',
            [id, 'pending']
        );

        if (pendingResult.rows.length === 0) {
            return res.status(404).json({ message: 'Pending object not found' });
        }

        const pending = pendingResult.rows[0];

        // Get the current published version (if exists)
        const publishedResult = await pool.query(`
            SELECT * FROM water_objects 
            WHERE canonical_id = $1 AND status = 'published'
        `, [pending.canonical_id]);

        const published = publishedResult.rows[0] || null;

        res.json({
            pending,
            published,
            isNewObject: !published
        });
    } catch (error) {
        console.error('Get diff error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * POST /api/admin/approve/:id
 * Approve a pending submission and publish it
 */
router.post('/approve/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Get the pending object
        const pendingResult = await pool.query(
            'SELECT * FROM water_objects WHERE id = $1 AND status = $2',
            [id, 'pending']
        );

        if (pendingResult.rows.length === 0) {
            return res.status(404).json({ message: 'Pending object not found' });
        }

        const pending = pendingResult.rows[0];

        // Start transaction
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Archive the current published version (if exists)
            await client.query(`
                UPDATE water_objects 
                SET status = 'archived'
                WHERE canonical_id = $1 AND status = 'published'
            `, [pending.canonical_id]);

            // Publish the pending version
            await client.query(`
                UPDATE water_objects 
                SET 
                    status = 'published',
                    published_at = CURRENT_TIMESTAMP,
                    reviewed_by = $1
                WHERE id = $2
            `, [req.user.id, id]);

            // Log the approval
            await client.query(`
                INSERT INTO change_logs (water_object_id, canonical_id, action, performed_by, reviewer_notes)
                VALUES ($1, $2, 'approve', $3, $4)
            `, [id, pending.canonical_id, req.user.id, req.body.notes || null]);

            await client.query('COMMIT');

            res.json({ message: 'Object approved and published successfully' });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Approve error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * POST /api/admin/reject/:id
 * Reject a pending submission
 */
router.post('/reject/:id', async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
        return res.status(400).json({ message: 'Rejection reason is required' });
    }

    try {
        // Get the pending object
        const pendingResult = await pool.query(
            'SELECT * FROM water_objects WHERE id = $1 AND status = $2',
            [id, 'pending']
        );

        if (pendingResult.rows.length === 0) {
            return res.status(404).json({ message: 'Pending object not found' });
        }

        const pending = pendingResult.rows[0];

        // Update status to rejected
        await pool.query(`
            UPDATE water_objects 
            SET 
                status = 'rejected',
                rejection_reason = $1,
                reviewed_by = $2
            WHERE id = $3
        `, [reason, req.user.id, id]);

        // Log the rejection
        await pool.query(`
            INSERT INTO change_logs (water_object_id, canonical_id, action, performed_by, reviewer_notes)
            VALUES ($1, $2, 'reject', $3, $4)
        `, [id, pending.canonical_id, req.user.id, reason]);

        res.json({ message: 'Object rejected successfully' });
    } catch (error) {
        console.error('Reject error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ============================================
// USER MANAGEMENT
// ============================================

/**
 * GET /api/admin/users
 * Get all users with their roles
 */
router.get('/users', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, name, email, role, created_at
            FROM users
            ORDER BY created_at DESC
        `);

        res.json({ users: result.rows });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * PUT /api/admin/users/:id/role
 * Change a user's role
 */
router.put('/users/:id/role', async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'expert', 'admin'].includes(role)) {
        return res.status(400).json({
            message: 'Invalid role. Must be: user, expert, or admin'
        });
    }

    // Prevent self-demotion
    if (parseInt(id) === req.user.id && role !== 'admin') {
        return res.status(400).json({
            message: 'Cannot change your own role'
        });
    }

    try {
        const result = await pool.query(`
            UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role
        `, [role, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'Role updated successfully',
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ============================================
// STATISTICS
// ============================================

/**
 * GET /api/admin/stats
 * Get dashboard statistics
 */
router.get('/stats', async (req, res) => {
    try {
        const stats = await pool.query(`
            SELECT
                (SELECT COUNT(*) FROM water_objects WHERE status = 'published') as published_count,
                (SELECT COUNT(*) FROM water_objects WHERE status = 'pending') as pending_count,
                (SELECT COUNT(*) FROM water_objects WHERE status = 'draft') as draft_count,
                (SELECT COUNT(*) FROM users WHERE role = 'expert') as expert_count,
                (SELECT COUNT(*) FROM users WHERE role = 'admin') as admin_count,
                (SELECT COUNT(*) FROM users) as total_users
        `);

        res.json({ stats: stats.rows[0] });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
