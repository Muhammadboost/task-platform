require('dotenv').config();
require('./config/db')();
setTimeout(async() => {
  const Submission = require('./models/Submission');
  const Task = require('./models/Task');
  const claimed = await Submission.find({ status: 'claimed' });
  for (let s of claimed) {
    await Task.findByIdAndUpdate(s.taskId, { $inc: { claimedCount: 1 } });
    console.log('Fixed task:', s.taskId);
  }
  console.log('Done!');
  process.exit();
}, 2000)
