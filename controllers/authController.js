const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role, phone, redditUsername, clientRegion } = req.body;

    if (role === 'worker' && !phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required for workers!' });
    }
    if (role === 'worker' && !redditUsername) {
      return res.status(400).json({ success: false, message: 'Reddit username is required for workers!' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered!' });
    }

    const existingReddit = redditUsername ? await User.findOne({ redditUsernames: redditUsername }) : null;
    if (existingReddit) {
      return res.status(400).json({ success: false, message: 'This Reddit account is already registered!' });
    }

    const userData = {
      name, email, password, role, phone,
      redditUsernames: redditUsername ? [redditUsername] : [],
      clientRegion: clientRegion || 'USA',
      paymentStatus: role === 'client' && clientRegion === 'PK' ? 'unpaid' : 'active'
    }

    const user = await User.create(userData);

    if (role !== 'admin') {
      return res.status(201).json({ success: true, pending: true, message: 'Account created! Please wait for admin approval.' });
    }

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
    if (!user) return res.status(400).json({ success: false, message: 'User not found!' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Wrong password!' });

    if (!user.isActive) return res.status(403).json({ success: false, message: 'Your account has been blocked. Contact admin.' });
    if (!user.isApproved && user.role !== 'admin' && user.role !== 'subadmin') {
      return res.status(403).json({ success: false, message: 'Your account is pending approval. Please wait for admin approval.' });
    }

    const token = generateToken(user._id);
    res.json({
      success: true, message: 'Login successful', token,
      user: {
        id: user._id, name: user.name, email: user.email,
        role: user.role, redditUsernames: user.redditUsernames,
        clientRegion: user.clientRegion, paymentStatus: user.paymentStatus,
        clientBalance: user.clientBalance
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
