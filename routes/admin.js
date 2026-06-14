const express = require('express');
const { isAuthenticated } = require('../middleware/auth');
const { getPendingTasks, approveTask, rejectTask } = require('../controllers/adminController');
const router = express.Router();

router.get('/pending-tasks', isAuthenticated, getPendingTasks);
router.post('/approve-task/:taskId', isAuthenticated, approveTask);
router.post('/reject-task/:taskId', isAuthenticated, rejectTask);

router.get('/all-workers', isAuthenticated, async (req, res) => {
  try {
    const User = require('../models/User');
    const workers = await User.find({ role: 'worker' }).select('name email redditUsernames isActive');
    res.json({ success: true, workers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/update-reddit/:userId', isAuthenticated, async (req, res) => {
  try {
    const User = require('../models/User');
    const { redditUsername } = req.body;
    const user = await User.findById(req.params.userId);
    if (user.redditUsernames.includes(redditUsername)) {
      return res.status(400).json({ success: false, message: 'This Reddit account already exists!' });
    }
    if (user.redditUsernames.length >= 3) {
      return res.status(400).json({ success: false, message: 'Maximum 3 Reddit accounts allowed!' });
    }
    user.redditUsernames.push(redditUsername);
    await user.save();
    res.json({ success: true, message: 'Reddit username added!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/block-worker/:userId', isAuthenticated, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.params.userId);
    await User.findByIdAndUpdate(req.params.userId, { isActive: !user.isActive });
    res.json({ success: true, message: 'Worker status updated!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.get('/earnings', isAuthenticated, async (req, res) => {
  try {
    const Task = require('../models/Task');
    const User = require('../models/User');
    const tasks = await Task.find({ adminApproved: true });
    const clients = await User.find({ role: 'client' }).select('name email');
    
    let totalCommission = 0;
    let clientBilling = [];

    for (let client of clients) {
      const clientTasks = tasks.filter(t => t.clientId.toString() === client._id.toString());
      const totalBill = clientTasks.reduce((sum, t) => sum + (t.budget * (t.workerLimit || 1)), 0);
      const delivered = clientTasks.reduce((sum, t) => sum + (t.budget * (t.completedCount || 0)), 0);
      const commission = clientTasks.reduce((sum, t) => {
        const amount = t.currency === 'USD' ? t.budget * (t.exchangeRate || 250) : t.budget;
        return sum + (amount * (t.completedCount || 0) * ((t.commissionRate || 50) / 100));
      }, 0);
      totalCommission += commission;
      if (clientTasks.length > 0) {
        clientBilling.push({
          name: client.name,
          email: client.email,
          totalTasks: clientTasks.length,
          totalBill: totalBill.toFixed(2),
          delivered: delivered.toFixed(2),
          pending: (totalBill - delivered).toFixed(2),
          commission: Math.floor(commission)
        });
      }
    }

    res.json({ success: true, totalCommission: Math.floor(totalCommission), clientBilling });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
