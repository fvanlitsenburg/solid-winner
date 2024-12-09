// db.js
const { Pool } = require('pg');

// Create a pool of connections to the database
// PostgreSQL connection
const pool = new Pool({
    user: 'myuser',
    host: 'localhost',
    database: 'mydatabase',
    password: 'mypassword',
    port: 5432,
  });

module.exports = pool;
