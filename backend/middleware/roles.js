// Role-based access control middleware

// Role hierarchy: admin > expert > user
const ROLE_HIERARCHY = { admin: 3, expert: 2, user: 1 };

/**
 * Middleware factory that checks if user has one of the allowed roles
 * @param  {...string} allowedRoles - Roles that can access the route
 */
export const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const userRole = req.user.role || 'user';

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                message: 'Insufficient permissions',
                required: allowedRoles,
                current: userRole
            });
        }

        next();
    };
};

// Convenience middleware for common role checks
export const requireExpert = requireRole('expert', 'admin');
export const requireAdmin = requireRole('admin');

export default { requireRole, requireExpert, requireAdmin };
