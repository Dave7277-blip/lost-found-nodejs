require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();

// Database Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
   ssl: { rejectUnauthorized: false },
  authPlugins: {
    mysql_clear_password: () => () => {
      return Buffer.from(`${process.env.DB_PASSWORD}\0`);
    }
  }
});

// Middleware
app.use(cors({
  origin: [
    'https://effervescent-ganache-80a158.netlify.app',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// File Upload Configuration
const upload = multer({ storage: multer.memoryStorage() });

// Routes
app.get('/api/items', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM items ORDER BY created_at DESC');
    const items = results.map(item => ({
      ...item,
      image1: item.image1?.toString('base64'),
      image2: item.image2?.toString('base64')
    }));
    res.json(items);
  } catch (err) {
    console.error('DB Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/items', upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 }
]), async (req, res) => {
  try {
    const { type, description, name, phone, date, location } = req.body;
    const image1 = req.files?.image1?.[0]?.buffer;
    const image2 = req.files?.image2?.[0]?.buffer;

    const [result] = await pool.query(
      `INSERT INTO items 
      (type, description, name, phone, date, location, image1, image2) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [type, description, name, phone, date, location, image1, image2]
    );

    res.status(201).json({
      id: result.insertId,
      type,
      description,
      name,
      phone,
      date,
      location,
      image1: image1?.toString('base64'),
      image2: image2?.toString('base64')
    });
  } catch (err) {
    console.error('Submission Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Test DB connection
  pool.query("SELECT 1")
    .then(() => console.log("✅ Database connected"))
    .catch(err => console.error("❌ Database connection failed:", err));
});
