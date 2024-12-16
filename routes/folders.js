const express = require('express');
const router = express.Router();
const pool = require('../db');

// Create a new folder
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

// Fetch all folders
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM folders');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching folders:', error);
    res.status(500).send('Server error');
  }
});

/// Fetch files associated with a specific folder
router.get('/:folderId/files', async (req, res) => {
  const { folderId } = req.params;

  try {
    const result = await pool.query(
      `SELECT f.id, f.name, f.path, 
        (SELECT describe FROM parsed_content pc 
          WHERE pc.file_id = f.id 
          ORDER BY pc.id ASC 
          LIMIT 1) AS describe
        FROM files f
        INNER JOIN folder_files ff ON ff.file_id = f.id
        WHERE ff.folder_id = $1;`, // Ensures the first `describe` is taken if multiple exist
      [folderId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching files for folder:', error);
    res.status(500).send('Server error');
  }
});


module.exports = router;
