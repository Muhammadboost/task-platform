const Task = require('../models/Task');

exports.getAvailableTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ status: 'open', adminApproved: true, assignedWorkerId: null });
    res.json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.claimTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findByIdAndUpdate(taskId, { assignedWorkerId: req.user.id, status: 'in_progress' }, { new: true });
    res.json({ success: true, message: 'Task claimed successfully', task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedWorkerId: req.user.id });
    res.json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
