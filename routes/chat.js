const express = require('express');
const { isAuthenticated } = require('../middleware/auth');
const Chat = require('../models/Chat');
const router = express.Router();

router.get('/messages', isAuthenticated, async (req, res) => {
  try {
    const messages = await Chat.find({}).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, messages: messages.reverse() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/send', isAuthenticated, async (req, res) => {
  try {
    const { message } = req.body;
    const chat = await Chat.create({
      sender: req.user.id,
      senderName: req.user.name,
      senderRole: req.user.role,
      message
    });
    res.json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
