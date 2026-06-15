const Task = require('../models/Task');

exports.createTask = async (req, res) => {
  try {
    const { title, description, budget, deadline, workerLimit, currency, exchangeRate, commissionRate, taskType, subreddit, postTitle, targetUsername, commentContent, commentText, extraNotes, refImageUrl } = req.body;
    const task = await Task.create({
      title, description, budget, deadline,
      workerLimit: workerLimit || 1,
      currency: currency || 'USD',
      exchangeRate: exchangeRate || 250,
      commissionRate: commissionRate || 50,
      taskType: taskType || '',
      subreddit: subreddit || '',
      postTitle: postTitle || '',
      targetUsername: targetUsername || '',
      commentContent: commentContent || '',
      commentText: commentText || '',
      extraNotes: extraNotes || '',
      refImageUrl: refImageUrl || '',
      clientId: req.user.id
    });
    res.status(201).json({ success: true, message: 'Task created!', task });
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
