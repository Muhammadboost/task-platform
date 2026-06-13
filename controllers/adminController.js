const Task = require('../models/Task');

exports.getPendingTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ adminApproved: false });
    res.json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.approveTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findByIdAndUpdate(taskId, { adminApproved: true }, { new: true });
    res.json({ success: true, message: 'Task approved', task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.rejectTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findByIdAndUpdate(taskId, { status: 'rejected' }, { new: true });
    res.json({ success: true, message: 'Task rejected', task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
