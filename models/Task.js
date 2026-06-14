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
workerLimit: { type: Number, default: 1 },
currency: { type: String, enum: ['USD', 'PKR'], default: 'USD' },
exchangeRate: { type: Number, default: 280 },
commissionRate: { type: Number, default: 50 },
completedCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', taskSchema);
