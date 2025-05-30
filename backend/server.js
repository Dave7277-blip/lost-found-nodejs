const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2/promise'); // Using promise-based API
require('dotenv').config();

const app = express();
app.use(cors({
  origin: [
    'https://effervescent-ganache-80a158.netlify.app', // Your Netlify frontend
    'http://localhost:3000' // For local development
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({ storage: multer.memoryStorage() });

// Database connection
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
};

async function initializeDatabase() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type ENUM('lost', 'found') NOT NULL,
        description TEXT,
        date DATE,
        location VARCHAR(255),
        image1 LONGBLOB,
        image2 LONGBLOB,
        name VARCHAR(100),
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log("Database initialized");
    return connection;
  } catch (err) {
    console.error("Database initialization failed:", err);
    throw err;
  }
}

// Initialize DB and start server
initializeDatabase().then(connection => {
  app.locals.db = connection;

  // API endpoints
  app.post('/api/items', upload.fields([{ name: 'image1' }, { name: 'image2' }]), async (req, res) => {
    try {
      const { type, description, name, phone, date, location } = req.body;
      const image1 = req.files?.image1?.[0]?.buffer || null;
      const image2 = req.files?.image2?.[0]?.buffer || null;

      const [result] = await connection.query(
        `INSERT INTO items (type, description, date, location, image1, image2, name, phone) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [type, description, date, location, image1, image2, name, phone]
      );

      res.json({
        id: result.insertId,
        type,
        description,
        date,
        location,
        name,
        phone,
        image1: image1 ? image1.toString('base64') : null,
        image2: image2 ? image2.toString('base64') : null
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/items', async (req, res) => {
    try {
      const [results] = await connection.query('SELECT * FROM items ORDER BY created_at DESC');
      
      const formatted = results.map(row => ({
        ...row,
        image1: row.image1?.toString('base64'),
        image2: row.image2?.toString('base64')
      }));

      res.json(formatted);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });
// Serve frontend files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend')));
  
  // Handle React routing, return all requests to frontend
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
  });
}

// Basic test route (always include this)
app.get('/', (req, res) => {
  res.json({ 
    status: 'Backend is running',
    available_routes: {
      items: '/api/items',
      post_item: '/api/items (POST)'
    }
  });
});

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
