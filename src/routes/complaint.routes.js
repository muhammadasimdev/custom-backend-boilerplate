import express from 'express';
import {
  createComplaint,
  getAllComplaints,
  getMyComplaints,
  exportComplaintsCsv,
  getComplaintById,
  upvoteComplaint,
  updateComplaintStatus,
  addFeedback,
} from '../controllers/complaint.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getAllComplaints);
router.get('/export', protect, authorize('officer'), exportComplaintsCsv);
router.get('/mine', protect, authorize('citizen'), getMyComplaints);
router.get('/:id', getComplaintById);

router.post('/', protect, authorize('citizen'), createComplaint);
router.patch('/:id/upvote', protect, authorize('citizen'), upvoteComplaint);
router.patch('/:id/status', protect, authorize('officer'), updateComplaintStatus); // IMPORTANT: This is a PATCH to /:id/status
router.patch('/:id/feedback', protect, authorize('citizen'), addFeedback);

export default router;
