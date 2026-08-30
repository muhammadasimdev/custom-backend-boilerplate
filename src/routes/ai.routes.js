import express from 'express';
import { getOfficerSummary } from '../controllers/ai.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/officer-summary', protect, authorize('officer'), getOfficerSummary);

export default router;