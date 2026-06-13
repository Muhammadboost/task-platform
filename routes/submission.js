const express = require('express');
const { isAuthenticated } = require('../middleware/auth');
const Submission = require('../models/Submission');
const Task = require('../models/Task');
const router = express.Router();

router.post('/submit/:taskId', isAuthenticated, async (req, res) => {
  try {
    const { description, proofFiles } = req.body;
    const submission = await Submission.create({
      taskId: req.params.taskId,
      workerId: req.user.id,
      description,
      proofFiles: proofFiles || [],
      status: 'submitted'
    });
    await Task.findByIdAndUpdate(req.params.taskId, { status: 'completed' });
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
    const submissions = await Submission.find({ status: 'submitted' }).populate('taskId', 'title budget').populate('workerId', 'name email');
    res.json({ success: true, submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/approve/:submissionId', isAuthenticated, async (req, res) => {
  try {
    const submission = await Submission.findByIdAndUpdate(req.params.submissionId, { status: 'approved' }, { new: true });
    res.json({ success: true, message: 'Approved!', submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/reject/:submissionId', isAuthenticated, async (req, res) => {
  try {
    const submission = await Submission.findByIdAndUpdate(req.params.submissionId, { status: 'rejected' }, { new: true });
    res.json({ success: true, message: 'Rejected!', submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
