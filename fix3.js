require('dotenv').config();
require('./config/db')();
setTimeout(async() => {
  const Task = require('./models/Task');
  const tasks = await Task.find({}).select('title workerLimit completedCount claimedCount');
  console.log(JSON.stringify(tasks, null, 2));
  process.exit();
}, 2000)
