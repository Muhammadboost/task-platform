const express = require('express');
const { isAuthenticated } = require('../middleware/auth');
const Payment = require('../models/Payment');
const User = require('../models/User');
const router = express.Router();

router.post('/request', isAuthenticated, async (req, res) => {
  try {
    const { amount, accountNumber, accountType } = req.body;
    const user = await User.findById(req.user.id);
    if (user.walletBalance < amount) {
      return res.status(400).json({ success: false, message: 'Balance kam hai!' });
    }
    const payment = await Payment.create({
      workerId: req.user.id,
      amount,
      accountNumber,
      accountType,
      status: 'pending'
    });
    res.json({ success: true, message: 'Request bhej di!', payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/my-requests', isAuthenticated, async (req, res) => {
  try {
    const payments = await Payment.find({ workerId: req.user.id });
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/all-requests', isAuthenticated, async (req, res) => {
  try {
    const payments = await Payment.find({ status: 'pending' }).populate('workerId', 'name email');
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/approve/:paymentId', isAuthenticated, async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.paymentId,
      { status: 'paid' },
      { new: true }
    );
    const user = await User.findById(payment.workerId);
    user.walletBalance -= payment.amount;
    await user.save();
    res.json({ success: true, message: 'Payment complete!', payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/reject/:paymentId', isAuthenticated, async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.paymentId,
      { status: 'rejected' },
      { new: true }
    );
    res.json({ success: true, message: 'Payment reject ho gai!', payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
