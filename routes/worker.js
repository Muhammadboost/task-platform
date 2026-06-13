const express = require('express');
const { isAuthenticated } = require('../middleware/auth');
const { getAvailableTasks, claimTask, getMyTasks } = require('../controllers/workerController');
const router = express.Router();

router.get('/available-tasks', isAuthenticated, getAvailableTasks);
router.post('/claim-task/:taskId', isAuthenticated, claimTask);
router.get('/my-tasks', isAuthenticated, getMyTasks);

module.exports = router;
