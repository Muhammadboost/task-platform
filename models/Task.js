const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  budget: { type: Number, required: true },
  status: { type: String, enum: ['open', 'in_progress', 'completed'], default: 'open' },
  assignedWorkerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deadline: Date,
  adminApproved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', taskSchema);
