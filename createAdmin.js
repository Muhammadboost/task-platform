require('dotenv').config();
require('./config/db')();
setTimeout(async() => {
  const User = require('./models/User');
  await User.deleteMany({ role: 'admin' });
  const user = new User({
    name: 'Admin',
    email: 'muhammadusamablogger@gmail.com',
    password: '090078601',
    role: 'admin',
    isApproved: true,
    isActive: true
  });
  await user.save();
  console.log('Admin created!');
  process.exit();
}, 2000)
