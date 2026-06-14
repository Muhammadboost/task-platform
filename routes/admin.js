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

module.exports = router;
