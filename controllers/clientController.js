const Task = require('../models/Task');
const User = require('../models/User');

exports.createTask = async (req, res) => {
  try {
    const { title, description, budget, deadline, workerLimit, currency, exchangeRate, commissionRate, taskType, subreddit, postTitle, targetUsername, commentContent, commentText, extraNotes, refImageUrl } = req.body;

    const client = await User.findById(req.user.id)

    if (client.clientRegion === 'PK') {
      if (client.paymentStatus !== 'active') {
        return res.status(403).json({ success: false, message: 'Please upload payment proof and wait for admin approval to create tasks.' })
      }
      const totalCost = currency === 'PKR' ? Number(budget) * Number(workerLimit || 1) : Number(budget) * 250 * Number(workerLimit || 1)
      if (client.clientBalance < totalCost) {
        return res.status(403).json({ success: false, message: `Insufficient balance! You need Rs. ${totalCost} but have Rs. ${client.clientBalance}. Please add more funds.` })
      }
      await User.findByIdAndUpdate(req.user.id, { $inc: { clientBalance: -totalCost } })
    }

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
