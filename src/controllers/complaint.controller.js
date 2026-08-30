import Complaint from '../models/Complaint.js';

// POST /api/complaints (Logged-in citizen)
export const createComplaint = async (req, res) => {
  try {
    const { title, description, category, area, imageUrl } = req.body;

    const complaint = await Complaint.create({
      title,
      description,
      category,
      area,
      imageUrl,
      createdBy: req.user._id,
    });

    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/complaints (Public / Extra detail for officer)
export const getAllComplaints = async (req, res) => {
  try {
    const { category, area, status } = req.query;
    const query = {};

    if (category) query.category = category;
    if (area) query.area = area;
    if (status) query.status = status;

    const complaints = await Complaint.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/complaints/mine (Logged-in citizen)
export const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/complaints/export (Logged-in officer)
export const exportComplaintsCsv = async (req, res) => {
  try {
    const complaints = await Complaint.find().populate('createdBy', 'name email');

    let csv = 'ID,Title,Category,Area,Status,Upvotes,Priority,Created By,Created At\n';

    complaints.forEach((c) => {
      csv += `"${c._id}","${c.title}","${c.category}","${c.area}","${c.status}",${c.upvotes},"${c.priority}","${c.createdBy?.name || 'N/A'}","${c.createdAt}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=complaints.csv');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/complaints/:id (Public)
export const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate('createdBy', 'name email');
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/complaints/:id/upvote (Logged-in citizen)
export const upvoteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    if (complaint.upvotedBy.includes(req.user._id)) {
      return res.status(400).json({ message: 'You have already upvoted this complaint' });
    }

    complaint.upvotes += 1;
    complaint.upvotedBy.push(req.user._id);
    await complaint.save();

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/complaints/:id/status (Logged-in officer)
export const updateComplaintStatus = async (req, res) => {
  try {
    const { status, officerRemark } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    if (status) complaint.status = status;
    if (officerRemark) complaint.officerRemark = officerRemark;

    if (status === 'resolved') {
      complaint.feedbackPending = true;
    }

    await complaint.save();
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/complaints/:id/feedback (Logged-in complaint owner)
export const addFeedback = async (req, res) => {
  try {
    const { feedbackRating, feedbackComment } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    if (complaint.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the creator can give feedback' });
    }

    complaint.feedbackRating = feedbackRating;
    complaint.feedbackComment = feedbackComment;
    complaint.feedbackGiven = true;
    complaint.feedbackPending = false;

    await complaint.save();
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};