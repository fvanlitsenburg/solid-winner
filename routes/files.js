const express = require('express');
const multer = require('multer');
const path = require('path');
const pool = require('../db');
const router = express.Router();

// Set up file storage configuration using multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folderId = req.params.folderId;
    const folderPath = path.join(__dirname, '../uploads', folderId); // Define folder path where files should be stored
    const fs = require('fs');
    
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    cb(null, folderPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// POST /folders/:folderId/files - Upload file to folder
router.post('/', upload.single('file'), async (req, res) => {
  const folderId = req.params.folderId;
  const file = req.file;

  if (!file) {
    return res.status(400).send('No file uploaded');
  }

  try {
    const result = await pool.query(
      'INSERT INTO files (name, path, folder_id) VALUES ($1, $2, $3) RETURNING *',
      [file.originalname, file.path, folderId]
    );

    res.status(201).json({
      message: 'File uploaded successfully',
      file: result.rows[0], // Return the file details from the database
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
