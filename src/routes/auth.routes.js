import express from 'express';
import { signup, login, getProfile } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected profile routes (Handles both /profile and /me)
router.get('/profile', protect, getProfile);
router.get('/me', protect, getProfile);

export default router;