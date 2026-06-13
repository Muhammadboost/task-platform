const express = require('express');
const { isAuthenticated } = require('../middleware/auth');
const { createTask, getMyTasks } = require('../controllers/clientController');
const router = express.Router();

router.post('/create-task', isAuthenticated, createTask);
router.get('/my-tasks', isAuthenticated, getMyTasks);

module.exports = router;
