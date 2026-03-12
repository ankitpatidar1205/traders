const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mockEngine = require('./utils/mockEngine');
require('dotenv').config();

const app = express();
app.set('trust proxy', true);
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const authRoutes = require('./routes/authRoutes');
const tradeRoutes = require('./routes/tradeRoutes');
const userRoutes = require('./routes/userRoutes');
const fundRoutes = require('./routes/fundRoutes');
const securityRoutes = require('./routes/securityRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const signalRoutes = require('./routes/signalRoutes');
const systemRoutes = require('./routes/systemRoutes');
const requestRoutes = require('./routes/requestRoutes');
const accountRoutes = require('./routes/accountRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const supportRoutes = require('./routes/supportRoutes');
const aiRoutes = require('./routes/aiRoutes');
const { logIp } = require('./middleware/logger');

// Middleware
app.use(cors());
app.use(express.json());
app.use(logIp); // Log IP for every authenticated request

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/funds', fundRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/signals', signalRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/ai', aiRoutes);

// Routes Placeholder
app.get('/', (req, res) => {
  res.send('Traders API is running...');
});

// Socket.io logic for Live Prices
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('subscribe_market', (scrips) => {
    console.log(`User ${socket.id} subscribed to:`, scrips);
    // Join a room for these scrips
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Simulation of price updates for Socket.io using the dedicated Mock Engine
mockEngine.on('update', (prices) => {
  io.emit('price_update', prices);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = { app, io };
