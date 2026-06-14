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

module.exports = router;
