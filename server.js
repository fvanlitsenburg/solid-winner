// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

// Create an Express app
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from 'public' folder

// PostgreSQL connection
const pool = new Pool({
  user: 'myuser',
  host: 'localhost',
  database: 'mydatabase',
  password: 'mypassword',
  port: 5432,
});

// Routes

// 1. Fetch all questions
app.get('/questions', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM questions');
    console.log(result);
    console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching questions');
  }
});

// 2. Add a new question
app.post('/questions', async (req, res) => {
  const { question, query, prompt } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO questions (question, query, prompt) VALUES ($1, $2, $3) RETURNING *',
      [question, query, prompt]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error adding question');
  }
});

// 3. Fetch all forms
app.get('/forms', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM forms');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching forms');
  }
});

// 4. Add a new form
app.post('/forms', async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO forms (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error adding form');
  }
});


// 5. Trigger a run
app.post('/run', async (req, res) => {
  const { questionId } = req.body;
  try {
    // Logic to trigger the RAG process (or other backend task)
    res.status(200).send(`Run triggered for question ID: ${questionId}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error triggering run');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// 6. Update question

app.put('/forms/:formId/questions/:id', async (req, res) => {
  const { formId, id } = req.params; // Now also extracting formId
  const { query, prompt } = req.body;

  try {
    const result = await pool.query(
      'UPDATE questions SET query = $1, prompt = $2 WHERE id = $3 AND form_id = $4 RETURNING *',
      [query, prompt, id, formId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found or does not belong to this form.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating question');
  }
});

  
  // 7. Add a new question
  app.post('/forms/:formId/questions', async (req, res) => {
    const { formId } = req.params;
    const { question, query, prompt } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO questions (form_id, question, query, prompt) VALUES ($1, $2, $3, $4) RETURNING *',
        [formId, question, query, prompt]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error adding question');
    }
  });
  
  
  // 8. Delete a question
  app.delete('/questions/:id', async (req, res) => {
    const { id } = req.params;

    try {
      const result = await pool.query('DELETE FROM questions WHERE id = $1', [id]);
      
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Question not found' });
      }

      res.status(200).json({ message: 'Deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error deleting question' });
    }
  });

  // Get questions for a specific form
  app.get('/forms/:formId/questions', async (req, res) => {
    const { formId } = req.params;
    try {
      const questionsResult = await pool.query(
        'SELECT * FROM questions WHERE form_id = $1',
        [formId]
      );
      res.json(questionsResult.rows);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching questions');
    }
  });


  // Endpoint to fetch all forms
  app.get('/forms', async (req, res) => {
    try {
      const forms = await getAllForms();
      res.json(forms);
    } catch (error) {
      console.error('Error fetching forms:', error);
      res.status(500).send({ error: 'Failed to fetch forms' });
    }
  });