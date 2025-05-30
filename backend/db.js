// backend/db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'shuttle.proxy.rlwy.net', // Should be trolley_proxy.rlwy.net
  port: 3306, // From Railway (not 3306)
  user: 'root',
  password: pAJygxdfaLILeYHrAOsTjhCuwyrNkfgf,
  database: railway,
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool;
