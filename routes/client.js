const express = require('express');
const { isAuthenticated } = require('../middleware/auth');
const { createTask, getMyTasks } = require('../controllers/clientController');
const router = express.Router();

router.post('/create-task', isAuthenticated, createTask);
router.get('/my-tasks', isAuthenticated, getMyTasks);

router.post('/cancel-task/:taskId', isAuthenticated, async (req, res) => {
  try {
    const Task = require('../models/Task');
    await Task.findOneAndUpdate({ _id: req.params.taskId, clientId: req.user.id }, { status: 'cancelled' });
    res.json({ success: true, message: 'Task cancelled!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/update-limit/:taskId', isAuthenticated, async (req, res) => {
  try {
    const Task = require('../models/Task');
    const { workerLimit } = req.body;
    await Task.findOneAndUpdate({ _id: req.params.taskId, clientId: req.user.id }, { workerLimit: Number(workerLimit) });
    res.json({ success: true, message: 'Worker limit updated!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/stats', isAuthenticated, async (req, res) => {
  try {
    const Task = require('../models/Task');
    const tasks = await Task.find({ clientId: req.user.id });
    const total = tasks.length;
    const approved = tasks.filter(t => t.adminApproved).length;
    const cancelled = tasks.filter(t => t.status === 'cancelled').length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = tasks.filter(t => !t.adminApproved && t.status !== 'cancelled').length;
    const totalWorkers = tasks.reduce((sum, t) => sum + (t.completedCount || 0), 0);
    const successRate = approved > 0 ? Math.round((completed / approved) * 100) : 0;
    const totalSpent = tasks.reduce((sum, t) => {
      const amount = t.currency === 'USD' ? t.budget * (t.exchangeRate || 250) : t.budget;
      return sum + (amount * (t.completedCount || 0));
    }, 0);
    const pendingPayment = tasks.reduce((sum, t) => {
      if (t.status === 'open' || t.status === 'in_progress') {
        const amount = t.currency === 'USD' ? t.budget * (t.exchangeRate || 250) : t.budget;
        return sum + (amount * (t.workerLimit || 1));
      }
      return sum;
    }, 0);
    res.json({ success: true, stats: { total, approved, cancelled, completed, pending, totalWorkers, successRate, totalSpent: Math.floor(totalSpent), pendingPayment: Math.floor(pendingPayment) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    const User = require('../models/User')
    const user = await User.findById(req.user.id).select('-password')
    res.json({ success: true, user })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

router.post('/update-currency', isAuthenticated, async (req, res) => {
  try {
    const User = require('../models/User')
    const { preferredCurrency } = req.body
    await User.findByIdAndUpdate(req.user.id, { preferredCurrency })
    res.json({ success: true, message: 'Currency updated!' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

router.post('/upload-payment-proof', isAuthenticated, async (req, res) => {
  try {
    const User = require('../models/User')
    const { proofUrl, amount } = req.body
    await User.findByIdAndUpdate(req.user.id, {
      paymentProofUrl: proofUrl,
      paymentStatus: 'pending'
    })
    res.json({ success: true, message: 'Payment proof uploaded! Admin will verify shortly.' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

router.get('/my-balance', isAuthenticated, async (req, res) => {
  try {
    const User = require('../models/User')
    const user = await User.findById(req.user.id).select('clientBalance clientRegion paymentStatus')
    res.json({ success: true, clientBalance: user.clientBalance, clientRegion: user.clientRegion, paymentStatus: user.paymentStatus })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})
