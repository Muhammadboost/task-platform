const express = require('express');
const { isAuthenticated } = require('../middleware/auth');
const Support = require('../models/Support');
const router = express.Router();

router.post('/create', isAuthenticated, async (req, res) => {
  try {
    const { subject, message } = req.body;
    const ticket = await Support.create({
      userId: req.user.id,
      subject,
      messages: [{
        sender: req.user.id,
        senderName: req.user.name,
        senderRole: req.user.role,
        message
      }]
    });
    res.json({ success: true, message: 'Ticket created!', ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/my-tickets', isAuthenticated, async (req, res) => {
  try {
    const tickets = await Support.find({ userId: req.user.id }).sort({ updatedAt: -1 });
    res.json({ success: true, tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/all-tickets', isAuthenticated, async (req, res) => {
  try {
    const tickets = await Support.find({}).populate('userId', 'name email role').sort({ updatedAt: -1 });
    res.json({ success: true, tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/reply/:ticketId', isAuthenticated, async (req, res) => {
  try {
    const { message } = req.body;
    const ticket = await Support.findByIdAndUpdate(
      req.params.ticketId,
      {
        $push: {
          messages: {
            sender: req.user.id,
            senderName: req.user.name,
            senderRole: req.user.role,
            message
          }
        }
      },
      { new: true }
    );
    res.json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/close/:ticketId', isAuthenticated, async (req, res) => {
  try {
    await Support.findByIdAndUpdate(req.params.ticketId, { status: 'closed' });
    res.json({ success: true, message: 'Ticket closed!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
