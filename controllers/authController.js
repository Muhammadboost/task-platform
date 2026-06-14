const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role, phone, redditUsername } = req.body;
    if (role === 'worker' && !redditUsername) {
      return res.status(400).json({ success: false, message: 'Reddit username is required for workers!' });
    }
    const existingReddit = redditUsername ? await User.findOne({ redditUsernames: redditUsername }) : null;
    if (existingReddit) {
      return res.status(400).json({ success: false, message: 'This Reddit account is already registered!' });
    }
    const user = await User.create({ name, email, password, role, phone, redditUsernames: redditUsername ? [redditUsername] : [] });
    const token = generateToken(user._id);
    res.status(201).json({ success: true, message: 'Account created', token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: 'User not found' });
    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Wrong password' });
    const token = generateToken(user._id);
    res.json({ success: true, message: 'Login successful', token, user: { id: user._id, name: user.name, email: user.email, role: user.role, redditUsernames: user.redditUsernames } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
