import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Extract token from Bearer header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // 2. Reject if token is missing or stringified "null"/"undefined"
    if (!token || token === 'null' || token === 'undefined') {
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    // 3. Verify token signature
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');

    // 4. Extract ID safely (supports both decoded.id and decoded._id)
    const userId = decoded.id || decoded._id;

    // 5. Fetch user from MongoDB
    req.user = await User.findById(userId).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'User account no longer exists in database' });
    }

    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    // Falls back to 'citizen' if role is not set on older accounts
    const userRole = req.user?.role || 'citizen';

    if (!req.user || !roles.includes(userRole)) {
      return res.status(403).json({
        message: `Role (${userRole}) is not authorized to access this route`,
      });
    }
    next();
  };
};          