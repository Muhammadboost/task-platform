const Task = require('../models/Task');
const Submission = require('../models/Submission');
const User = require('../models/User');

exports.getAvailableTasks = async (req, res) => {
  try {
const workerUser = await User.findById(req.user.id);
if (!workerUser.isApproved) {
  return res.status(403).json({ success: false, message: 'Your account is pending approval!' });
} 
   const claimedTasks = await Submission.find({ workerId: req.user.id }).select('taskId');
    const claimedTaskIds = claimedTasks.map(s => s.taskId.toString());
    const tasks = await Task.find({
      status: 'open',
      adminApproved: true,
      $expr: { $lt: [{ $add: ['$completedCount', { $ifNull: ['$claimedCount', 0] }] }, '$workerLimit'] }
    });
    const availableTasks = tasks.filter(t => !claimedTaskIds.includes(t._id.toString()));
    res.json({ success: true, count: availableTasks.length, tasks: availableTasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.claimTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found!' });
    if (task.completedCount >= task.workerLimit) {
      return res.status(400).json({ success: false, message: 'Task limit full!' });
    }
    const existing = await Submission.findOne({ taskId, workerId: req.user.id });
    if (existing) return res.status(400).json({ success: false, message: 'Already claimed!' });
await Task.findByIdAndUpdate(taskId, { $inc: { claimedCount: 1 } }); 
   const submission = await Submission.create({
      taskId,
      workerId: req.user.id,
      status: 'claimed',
      description: '',
      proofFiles: []
    });
    res.json({ success: true, message: 'Task claimed!', submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyTasks = async (req, res) => {
  try {
    const submissions = await Submission.find({ workerId: req.user.id }).populate('taskId');
    res.json({ success: true, tasks: submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
