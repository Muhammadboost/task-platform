const express = require('express');
const { isAuthenticated } = require('../middleware/auth');
const { getPendingTasks, approveTask, rejectTask } = require('../controllers/adminController');
const router = express.Router();

router.get('/pending-tasks', isAuthenticated, getPendingTasks);
router.post('/approve-task/:taskId', isAuthenticated, approveTask);
router.post('/reject-task/:taskId', isAuthenticated, rejectTask);

module.exports = router;
