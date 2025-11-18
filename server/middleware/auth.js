import { verifyToken } from '../controllers/adminController.js';

/**
 * Authenticate JWT token middleware
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }

  req.user = user;
  next();
};

/**
 * Require super admin role middleware
 */
export const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Super admin access required'
    });
  }
  next();
};

/**
 * Require admin role middleware
 */
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

/**
 * Require specific roles middleware
 */
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`
      });
    }
    next();
  };
};
