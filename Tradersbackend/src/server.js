const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mockEngine = require('./utils/mockEngine');
const runMigrations = require('./config/migrate');
const { setIo }     = require('./config/socket');
require('dotenv').config();

const app = express();
app.set('trust proxy', true);
const server = http.createServer(app);
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
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
const { aiParse, executeVoiceCommand } = require('./controllers/aiController');
const kiteRoutes = require('./routes/kiteRoutes');
const bankRoutes = require('./routes/bankRoutes');
const newClientBankRoutes = require('./routes/newClientBankRoutes');
const adminRoutes        = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { logIp } = require('./middleware/logger');

// Middleware
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(express.json());
app.use(logIp); // Log IP for every authenticated request

// Serve uploaded files statically
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
app.use('/api/kite', kiteRoutes);
app.use('/api/bank', bankRoutes);
app.use('/api/new-client-bank', newClientBankRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// ── Root-level voice AI routes (no /api prefix, no auth required for direct access)
app.post('/ai-parse', aiParse);
app.post('/execute-command', executeVoiceCommand);

// Routes Placeholder
app.get('/', (req, res) => {
  res.send('Traders API is running...');
});

// Socket.io logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Client sends { userId, role } right after connecting
  socket.on('join', ({ userId, role }) => {
    if (userId) socket.join(`user:${userId}`);
    if (role)   socket.join(`role:${role}`);
  });

  socket.on('subscribe_market', (scrips) => {
    console.log(`User ${socket.id} subscribed to:`, scrips);
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

// Share io instance with controllers (before migrations)
setIo(io);

// Run DB migrations first, then start server
runMigrations()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ Migration failed, server not started:', err.message);
        process.exit(1);
    });

// Trigger nodemon restart

module.exports = { app, io };
