require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const app = express();
connectDB();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
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

const PORT = process.env.PORT || 3000;
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

io.on('connection', (socket) => {
  socket.on('join', (userData) => {
    socket.userData = userData;
  });
  socket.on('sendMessage', async (data) => {
    const Chat = require('./models/Chat');
    const chat = await Chat.create({
      sender: data.userId,
      senderName: data.senderName,
      senderRole: data.senderRole,
      message: data.message
    });
    io.emit('newMessage', chat);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
