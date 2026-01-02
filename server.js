
const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_123';

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'chronoflow',
  waitForConnections: true,
  connectionLimit: 10
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- Auth Routes ---
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    
    // In production, use bcrypt.compare(password, user.password)
    // For this demonstration, we check if user exists and password matches
    if (user && (password === user.password)) {
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, role, department } = req.body;
  const id = 'u-' + Math.random().toString(36).substr(2, 9);
  const avatar = `https://picsum.photos/seed/${name.split(' ')[0]}/200`;
  
  try {
    // In production, hash the password: const hashedPassword = await bcrypt.hash('password', 10);
    await pool.execute(
      'INSERT INTO users (id, name, email, password, role, department, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, name, email, 'password', role, department, avatar]
    );
    res.status(201).json({ id, name, email, role });
  } catch (err) {
    res.status(400).json({ error: 'Email already exists or database error' });
  }
});

// --- User Management ---
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id, name, email, role, department, avatar FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Attendance Routes ---
app.get('/api/attendance', authenticateToken, async (req, res) => {
  const userId = req.query.userId;
  try {
    let query = 'SELECT * FROM attendance';
    let params = [];
    if (userId) {
      query += ' WHERE userId = ?';
      params.push(userId);
    }
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/attendance', authenticateToken, async (req, res) => {
  const { id, userId, date, clockIn, clockOut, status } = req.body;
  try {
    await pool.execute(
      'INSERT INTO attendance (id, userId, date, clockIn, clockOut, status) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE clockOut = ?, status = ?',
      [id, userId, date, clockIn, clockOut, status, clockOut, status]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Leave Routes ---
app.get('/api/leaves', authenticateToken, async (req, res) => {
  const userId = req.query.userId;
  try {
    let query = 'SELECT * FROM leave_requests';
    let params = [];
    if (userId) {
      query += ' WHERE userId = ?';
      params.push(userId);
    }
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/leaves', authenticateToken, async (req, res) => {
  const { id, userId, type, startDate, endDate, status, reason } = req.body;
  try {
    await pool.execute(
      'INSERT INTO leave_requests (id, userId, type, startDate, endDate, status, reason) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, userId, type, startDate, endDate, status, reason]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/leaves/:id', authenticateToken, async (req, res) => {
  const { status } = req.body;
  try {
    await pool.execute('UPDATE leave_requests SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
