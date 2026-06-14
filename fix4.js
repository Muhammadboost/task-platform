require('dotenv').config();
require('./config/db')();
setTimeout(async() => {
  const User = require('./models/User');
  await User.updateMany({ role: { $ne: 'admin' } }, { isApproved: true });
  console.log('All existing users approved!');
  process.exit();
}, 2000)
