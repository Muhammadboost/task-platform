const Task = require('../models/Task');

exports.createTask = async (req, res) => {
  try {
    const { title, description, budget, deadline, priority, workerLimit, currency, exchangeRate, commissionRate } = req.body;
    const task = await Task.create({
      title,
      description,
      budget,
      deadline,
      priority: priority || 'medium',
workerLimit: workerLimit || 1,
currency: currency || 'USD',

exchangeRate: exchangeRate || 250,

commissionRate: commissionRate || 50,
      clientId: req.user.id
    });
    res.status(201).json({ success: true, message: 'Task created successfully', task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ clientId: req.user.id });
    res.json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
