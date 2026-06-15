require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

connectDB();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts, please try again later.' }
});

app.use(limiter);
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json());

app.use('/api/auth', authLimiter);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/client', require('./routes/client'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/worker', require('./routes/worker'));
app.use('/api/submission', require('./routes/submission'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/support', require('./routes/support'));
app.use('/api/chat', require('./routes/chat'));

app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
  socket.on('join', (userData) => {
    socket.userData = userData;
  });
  socket.on('chat:send', async (data) => {
    try {
      const Chat = require('./models/Chat');
      const jwt = require('jsonwebtoken');
      const token = socket.handshake.auth?.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const User = require('./models/User');
      const user = await User.findById(decoded.id);
      const chat = await Chat.create({
        sender: user._id,
        senderName: user.name,
        senderRole: user.role,
        message: data.message
      });
      io.emit('chat:message', chat);
    } catch (err) {
      console.error('Chat error:', err.message);
    }
  });
  socket.on('sendMessage', async (data) => {
    try {
      const Chat = require('./models/Chat');
      const chat = await Chat.create({
        sender: data.userId,
        senderName: data.senderName,
        senderRole: data.senderRole,
        message: data.message
      });
      io.emit('newMessage', chat);
      io.emit('chat:message', chat);
    } catch (err) {
      console.error(err);
    }
  });
});

const startCleanup = require('./utils/cleanup')
startCleanup()
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
