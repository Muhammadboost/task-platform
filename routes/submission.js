const express = require('express');
const { isAuthenticated } = require('../middleware/auth');
const Submission = require('../models/Submission');
const Task = require('../models/Task');
const User = require('../models/User');
const router = express.Router();

router.post('/submit/:taskId', isAuthenticated, async (req, res) => {
  try {
    const { description, proofFiles } = req.body;
const existing = await Submission.findOne({ taskId: req.params.taskId, workerId: req.user.id });
if (existing && existing.status !== 'claimed') {
  return res.status(400).json({ success: false, message: 'You have already submitted this task!' });
}
if (existing && existing.status === 'claimed') {
  existing.description = description;
  existing.proofFiles = proofFiles || [];
  existing.status = 'submitted';
  await existing.save();
  const taskData = await Task.findById(req.params.taskId);
  const newCount = (taskData.completedCount || 0) + 1;
  const newStatus = newCount >= taskData.workerLimit ? 'completed' : 'open';
  await Task.findByIdAndUpdate(req.params.taskId, { completedCount: newCount, status: newStatus });
  return res.json({ success: true, message: 'Work submitted!', submission: existing });
}
    const submission = await Submission.create({
      taskId: req.params.taskId,
      workerId: req.user.id,
      description,
      proofFiles: proofFiles || [],
      status: 'submitted'
    });
    const taskData = await Task.findById(req.params.taskId);
const newCount = (taskData.completedCount || 0) + 1;
const newStatus = newCount >= taskData.workerLimit ? 'completed' : 'open';
await Task.findByIdAndUpdate(req.params.taskId, { completedCount: newCount, status: newStatus });
    res.json({ success: true, message: 'Work submitted!', submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/my-submissions', isAuthenticated, async (req, res) => {
  try {
    const submissions = await Submission.find({ workerId: req.user.id }).populate('taskId', 'title budget');
    res.json({ success: true, submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/pending', isAuthenticated, async (req, res) => {
  try {
    const submissions = await Submission.find({ status: 'submitted' }).populate('taskId', 'title budget').populate('workerId', 'name email redditUsernames')
    res.json({ success: true, submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/approve/:submissionId', isAuthenticated, async (req, res) => {
  try {
    const submission = await Submission.findByIdAndUpdate(
      req.params.submissionId,
      { status: 'approved' },
      { new: true }
    );
    console.log('Submission:', JSON.stringify(submission));
    const task = await Task.findById(submission.taskId);
    console.log('Task budget:', task ? task.budget : 'task not found');
    const worker = await User.findById(submission.workerId);
    console.log('Worker balance before:', worker ? worker.walletBalance : 'worker not found');
    if (worker && task) {
      let workerAmount = task.budget;
if (task.currency === 'USD') {
  workerAmount = task.budget * (task.exchangeRate || 280);
}
workerAmount = Math.floor(workerAmount * ((100 - (task.commissionRate || 50)) / 100));
worker.walletBalance = (worker.walletBalance || 0) + workerAmount;
      await worker.save();
      console.log('Worker balance after:', worker.walletBalance);
    }
    res.json({ success: true, message: 'Approved! Balance add ho gaya!', submission });
  } catch (error) {
    console.log('ERROR:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/reject/:submissionId', isAuthenticated, async (req, res) => {
  try {
    const submission = await Submission.findByIdAndUpdate(
      req.params.submissionId,
      { status: 'rejected' },
      { new: true }
    );
    res.json({ success: true, message: 'Rejected!', submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
