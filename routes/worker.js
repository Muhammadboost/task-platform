const express = require('express');
const { isAuthenticated } = require('../middleware/auth');
const { getAvailableTasks, claimTask, getMyTasks } = require('../controllers/workerController');
const router = express.Router();

router.get('/available-tasks', isAuthenticated, getAvailableTasks);
router.post('/claim-task/:taskId', isAuthenticated, claimTask);
router.get('/my-tasks', isAuthenticated, getMyTasks);
router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/update-profile', isAuthenticated, async (req, res) => {
  try {
    const User = require('../models/User');
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { name, phone }, { new: true }).select('-password');
    res.json({ success: true, message: 'Profile updated!', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


module.exports = router;
