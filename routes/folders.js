const express = require('express');
const router = express.Router();
const pool = require('../db');

// Define routes for folders
router.post('/', async (req, res) => {
  const { name } = req.body;
  
  try {
    const result = await pool.query(
      'INSERT INTO folders (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).send('Server error');
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM folders');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching folders:', error);
    res.status(500).send('Server error');
  }
});

module.exports = router;