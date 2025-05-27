const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });
app.use(express.static(path.join(__dirname, '../frontend')));

db.query(`
  CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('lost', 'found') NOT NULL,
    description TEXT,
    image1 LONGBLOB,
    image2 LONGBLOB,
    name VARCHAR(100),
    phone VARCHAR(20)
  )
`, (err) => {
  if (err) throw err;
  console.log("Table 'items' is ready");
});

app.post('/api/items', upload.fields([{ name: 'image1' }, { name: 'image2' }]), (req, res) => {
  const { type, description, name, phone, date, location } = req.body;
  const image1 = req.files?.image1?.[0]?.buffer || null;
  const image2 = req.files?.image2?.[0]?.buffer || null;

  const sql = `INSERT INTO items (type, description, date, location, image1, image2, name, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  db.query(sql, [type, description, image1, image2, name, phone], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({
      id: result.insertId,
      type,
      description,
      date,
      location,
      image1: image1 ? image1.toString('base64') : '',
      image2: image2 ? image2.toString('base64') : '',
      name,
      phone
    });
  });
});

app.get('/api/items', (req, res) => {
  db.query('SELECT * FROM items ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    const formatted = results.map(row => ({
      ...row,
      image1: row.image1?.toString('base64'),
      image2: row.image2?.toString('base64')
    }));

    res.json(formatted);
  });
});

app.listen(5000, () => console.log('Server running on http://localhost:5000'));
