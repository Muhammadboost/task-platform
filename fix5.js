require('dotenv').config();
require('./config/db')();
setTimeout(async() => {
  const Task = require('./models/Task');
  const Submission = require('./models/Submission');
  const tasks = await Task.find({});
  for (let t of tasks) {
    const claimed = await Submission.countDocuments({ taskId: t._id, status: 'claimed' });
    await Task.findByIdAndUpdate(t._id, { claimedCount: claimed });
    console.log(`Fixed: ${t.title} - claimedCount: ${claimed}`);
  }
  console.log('Done!');
  process.exit();
}, 2000)
