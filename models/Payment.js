const mongoose = require('mongoose');
const PaymentSchema = new mongoose.Schema({
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  accountNumber: { type: String, required: true },
  accountName: { type: String, default: '' },
  accountType: { type: String, enum: ['jazzcash', 'easypaisa'], required: true },
  status: { type: String, enum: ['pending', 'paid', 'rejected'], default: 'pending' },
  note: { type: String },
}, { timestamps: true });
module.exports = mongoose.model('Payment', PaymentSchema);
