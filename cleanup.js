require('dotenv').config();
require('./config/db')();
setTimeout(async() => {
  const User = require('./models/User');
  const Task = require('./models/Task');
  const Submission = require('./models/Submission');
  const Payment = require('./models/Payment');
  
  await User.deleteMany({});
  await Task.deleteMany({});
  await Submission.deleteMany({});
  await Payment.deleteMany({});
  
  console.log('All data deleted!');
  process.exit();
}, 2000)
