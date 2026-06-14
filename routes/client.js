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
    const Submission = require('../models/Submission');
    const tasks = await Task.find({ clientId: req.user.id });
    const total = tasks.length;
    const approved = tasks.filter(t => t.adminApproved).length;
    const cancelled = tasks.filter(t => t.status === 'cancelled').length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = tasks.filter(t => !t.adminApproved && t.status !== 'cancelled').length;
    const totalWorkers = tasks.reduce((sum, t) => sum + (t.completedCount || 0), 0);
    const successRate = approved > 0 ? Math.round((completed / approved) * 100) : 0;
    res.json({ success: true, stats: { total, approved, cancelled, completed, pending, totalWorkers, successRate } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
