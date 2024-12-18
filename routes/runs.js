const express = require('express');
const pool = require('../db');  // Assuming you have the pool set up for PostgreSQL
const router = express.Router();

// Endpoint to get the latest run output based on form_uuid and folder_uuid
router.get('/get-latest-run', async (req, res) => {
  const { run_uuid } = req.query;

  if (!run_uuid) {
    return res.status(400).json({ error: 'form_uuid and folder_uuid are required' });
  }

  try {
    // Query the database to get the latest form answers
    const query = `
      SELECT fa.question, fa.answer_text, fa.documents
      FROM form_answers fa
      WHERE fa.run_id = $1
      ORDER BY fa.created_at DESC
    `;
    
    const result = await pool.query(query, [run_uuid]);

    if (result.rows.length > 0) {
      // Return the latest run's answers
      res.json({
        answers: result.rows[0]
      });
    } else {
      res.json({ answers: null });
    }
  } catch (error) {
    console.error('Error fetching latest run:', error);
    res.status(500).json({ error: 'Failed to fetch the latest run results' });
  }
});

module.exports = router;
