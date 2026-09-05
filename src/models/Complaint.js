import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    area: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'resolved'], // MUST match frontend exact casing
      default: 'pending',
    },
    upvotes: { type: Number, default: 0 },
    upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    imageUrl: { type: String, default: '' },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    officerRemark: { type: String, default: '' },
    feedbackRating: { type: Number, min: 1, max: 5 },
    feedbackComment: { type: String, default: '' },
    feedbackGiven: { type: Boolean, default: false },
    feedbackPending: { type: Boolean, default: false },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Computed Priority dynamic property based on upvotes and age in hours
complaintSchema.virtual('priority').get(function () {
  const ageInHours = (Date.now() - new Date(this.createdAt).getTime()) / (1000 * 60 * 60);

  if (this.upvotes >= 20 || ageInHours >= 72) return 'Critical';
  if (this.upvotes >= 10 || ageInHours >= 48) return 'High';
  if (this.upvotes >= 5 || ageInHours >= 24) return 'Medium';
  return 'Low';
});

export default mongoose.model('Complaint', complaintSchema);



