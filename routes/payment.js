const express = require('express');
const { isAuthenticated } = require('../middleware/auth');
const Payment = require('../models/Payment');
const User = require('../models/User');
const router = express.Router();

router.post('/request', isAuthenticated, async (req, res) => {
  try {
    const { amount, accountNumber, accountType, accountName } = req.body;
    if (!amount || amount < 250) {
      return res.status(400).json({ success: false, message: 'Minimum withdrawal amount is Rs. 250!' });
    }
    const user = await User.findById(req.user.id);
    if (user.walletBalance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance!' });
    }
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const recentRequest = await Payment.findOne({
      workerId: req.user.id,
      createdAt: { $gte: oneWeekAgo },
      status: { $in: ['pending', 'paid'] }
    })
    if (recentRequest) {
      const nextDate = new Date(recentRequest.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000)
      const days = Math.ceil((nextDate - Date.now()) / (1000 * 60 * 60 * 24))
      return res.status(400).json({ success: false, message: `You can only request once per week. Next request available in ${days} day(s).` })
    }
    const payment = await Payment.create({
      workerId: req.user.id,
      amount,
      accountNumber,
      accountName: accountName || '',
      accountType,
      status: 'pending'
    });
    res.json({ success: true, message: 'Withdrawal request sent!', payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/my-requests', isAuthenticated, async (req, res) => {
  try {
    const payments = await Payment.find({ workerId: req.user.id }).sort({ createdAt: -1 });
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const recentRequest = await Payment.findOne({
      workerId: req.user.id,
      createdAt: { $gte: oneWeekAgo },
      status: { $in: ['pending', 'paid'] }
    })
    let nextWithdrawal = null
    if (recentRequest) {
      nextWithdrawal = new Date(recentRequest.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000)
    }
    res.json({ success: true, payments, nextWithdrawal });
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
    const payment = await Payment.findByIdAndUpdate(req.params.paymentId, { status: 'paid' }, { new: true });
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
    const payment = await Payment.findByIdAndUpdate(req.params.paymentId, { status: 'rejected' }, { new: true });
    res.json({ success: true, message: 'Payment rejected!', payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
