const express = require('express');
const axios = require('axios');
const pool = require('../db');
const upload = require('../middleware/upload'); // Assuming you have multer setup in middleware
const fs = require('fs');
const FormData = require('form-data');

const router = express.Router();

// Upload a file and process it with OCR
router.post('/', upload.single('file'), async (req, res) => {
  const { file } = req;
  const { folderId } = req.body;

  if (!file || !folderId) {
    return res.status(400).json({ error: 'File and folderId are required' });
  }

  try {
    // Call OCR service
    const formData = new FormData();
    formData.append('file', fs.createReadStream(file.path));

    let ocrResponse;
    try {
      ocrResponse = await axios.post('http://127.0.0.1:8000/ocr/', formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });
    } catch (ocrError) {
      if (ocrError.response && ocrError.response.data) {
        console.error('OCR processing failed:', ocrError.response.data);
      } else {
        console.error('OCR processing failed:', ocrError.message);
      }
            return res.status(500).json({ error: 'OCR processing failed' });
    }

    const { text, byte_streams } = ocrResponse.data;

    // Save file details to the database
    const fileResult = await pool.query(
      'INSERT INTO files (name, path) VALUES ($1, $2) RETURNING *',
      [file.originalname, file.path]
    );
    const uploadedFile = fileResult.rows[0];

    // Link file to folder
    await pool.query(
      'INSERT INTO folder_files (folder_id, file_id) VALUES ($1, $2)',
      [folderId, uploadedFile.id]
    );

    // Save parsed content to the database
    const parsedContentPromises = Object.entries(text).map(([pageNumber, pageText]) => {
      const parsedPageNumber = parseInt(pageNumber.replace('Page ', ''), 10);
      const ocrBytes = byte_streams ? byte_streams[pageNumber] : null;

      return pool.query(
        `INSERT INTO parsed_content (file_id, page_number, text_content, ocr_bytes)
         VALUES ($1, $2, $3, $4)`,
        [uploadedFile.id, parsedPageNumber, pageText, ocrBytes]
      );
    });

    await Promise.all(parsedContentPromises);

    res.status(201).json({ message: 'File uploaded and processed successfully', file: uploadedFile });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload and process file' });
  }
});

module.exports = router;
