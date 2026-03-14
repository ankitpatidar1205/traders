const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
    const user = rows[0];

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Track Login IP
    try {
        let ip = req.headers['x-forwarded-for'] || 
                 req.headers['x-real-ip'] || 
                 req.socket.remoteAddress || 
                 '';
        
        // Handle comma-separated list from proxies (first one is the client)
        if (ip.includes(',')) ip = ip.split(',')[0].trim();
        
        // Normalize IPv6 loopback and mapped addresses
        if (ip === '::1') ip = '127.0.0.1';
        if (ip.startsWith('::ffff:')) ip = ip.replace('::ffff:', '');
        
        const userAgent = req.headers['user-agent'];
        await db.execute(
            'INSERT INTO ip_logins (user_id, username, ip_address, user_agent) VALUES (?, ?, ?, ?)',
            [user.id, user.username, ip, userAgent]
        );
    } catch (logErr) {
        console.error('IP Logging failed:', logErr);
    }

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.full_name
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

const createUser = async (req, res) => {
    const { username, password, fullName, email, mobile, role, parentId, creditLimit } = req.body;
    const creatorRole = req.user.role;
    
    // Enforcement: Hierarchy Check
    // SUPERADMIN can create ADMIN, BROKER, or TRADER
    if (creatorRole === 'ADMIN' && (role === 'SUPERADMIN' || role === 'ADMIN')) {
        return res.status(403).json({ message: 'Admins cannot create other Admins or Superadmins' });
    }
    if (creatorRole === 'BROKER' && role !== 'TRADER') {
        return res.status(403).json({ message: 'Brokers can only create Traders' });
    }
    if (creatorRole === 'TRADER') {
        return res.status(403).json({ message: 'Traders cannot create users' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password || '123456', 10);
        
        const params = [
            username || null,
            hashedPassword,
            fullName || null,
            email || null,
            mobile || null,
            role || 'TRADER',
            parentId || req.user.id,
            creditLimit || 0,
            'Active'
        ];

        console.log('Inserting user with params:', params);

        const [result] = await db.execute(
            'INSERT INTO users (username, password, full_name, email, mobile, role, parent_id, credit_limit, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            params
        );

        const newUserId = result.insertId;

        // Auto-create client_settings (all roles)
        try {
            await db.execute('INSERT IGNORE INTO client_settings (user_id) VALUES (?)', [newUserId]);
        } catch (e) { console.error('client_settings auto-create failed:', e.message); }

        // Auto-create broker_shares (BROKER and ADMIN)
        if (['BROKER', 'ADMIN'].includes(role || 'TRADER')) {
            try {
                await db.execute('INSERT IGNORE INTO broker_shares (user_id) VALUES (?)', [newUserId]);
            } catch (e) { console.error('broker_shares auto-create failed:', e.message); }
        }

        // Auto-create user_segments (6 rows, all disabled by default)
        const segments = ['MCX', 'EQUITY', 'OPTIONS', 'COMEX', 'FOREX', 'CRYPTO'];
        for (const segment of segments) {
            try {
                await db.execute(
                    'INSERT IGNORE INTO user_segments (user_id, segment) VALUES (?, ?)',
                    [newUserId, segment]
                );
            } catch (e) { console.error(`user_segments auto-create failed for ${segment}:`, e.message); }
        }

        res.status(201).json({ message: 'User created successfully', id: newUserId });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Username already exists' });
        }
        console.error('Database Error:', err);
        res.status(500).send('Server Error');
    }
};

const updateTransactionPassword = async (req, res) => {
    const { newPassword } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.execute('UPDATE users SET transaction_password = ? WHERE id = ?', [hashedPassword, req.user.id]);
        res.json({ message: 'Transaction password updated' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

const changePassword = async (req, res) => {
    const { newPassword } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);
        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

module.exports = { login, createUser, updateTransactionPassword, changePassword };
