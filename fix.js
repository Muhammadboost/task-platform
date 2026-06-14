require('dotenv').config();
require('./config/db')();
setTimeout(async() => {
  const T = require('./models/Task');
  const tasks = await T.find({ status: 'completed' });
  for (let t of tasks) {
    if (!t.completedCount) {
      await T.findByIdAndUpdate(t._id, { completedCount: t.workerLimit || 1 });
      console.log('Fixed:', t.title);
    }
  }
  console.log('Done!');
  process.exit();
}, 2000)
