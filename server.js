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

  // 5. Delete a form
app.delete('/forms/:id', async (req, res) => {
  const formId = req.params.id;
  
  try {
    // Delete the form by its ID
    const result = await pool.query(
      'DELETE FROM forms WHERE id = $1 RETURNING *', 
      [formId]
    );

    if (result.rowCount === 0) {
      // If no form was found with that ID
      return res.status(404).send('Form not found');
    }

    // Successfully deleted the form
    res.status(200).json({ message: 'Form deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting form');
  }
});

// FOLDERS

// POST /folders - Create a new folder
app.post('/folders', async (req, res) => {
  const { name, parentFolderId } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO folders (name, parent_folder_id) VALUES ($1, $2) RETURNING *',
      [name, parentFolderId || null] // Null for root folders
    );

    res.status(201).json(result.rows[0]); // Return the newly created folder
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).send('Server error');
  }
});

// GET /folders - Get all folders
app.get('/folders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM folders');
    res.status(200).json(result.rows); // Return all folders
  } catch (error) {
    console.error('Error fetching folders:', error);
    res.status(500).send('Server error');
  }
});

// GET /folders/:folderId - Get a specific folder
app.get('/folders/:folderId', async (req, res) => {
  const { folderId } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM folders WHERE id = $1',
      [folderId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).send('Folder not found');
    }

    res.status(200).json(result.rows[0]); // Return the folder details
  } catch (error) {
    console.error('Error fetching folder:', error);
    res.status(500).send('Server error');
  }
});

// PUT /folders/:folderId - Update folder details
app.put('/folders/:folderId', async (req, res) => {
  const { folderId } = req.params;
  const { name, parentFolderId } = req.body;

  try {
    const result = await pool.query(
      'UPDATE folders SET name = $1, parent_folder_id = $2 WHERE id = $3 RETURNING *',
      [name, parentFolderId || null, folderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).send('Folder not found');
    }

    res.status(200).json(result.rows[0]); // Return updated folder
  } catch (error) {
    console.error('Error updating folder:', error);
    res.status(500).send('Server error');
  }
});

// DELETE /folders/:folderId - Delete folder
app.delete('/folders/:folderId', async (req, res) => {
  const { folderId } = req.params;

  try {
    // Delete files associated with the folder
    await pool.query('DELETE FROM files WHERE folder_id = $1', [folderId]);

    // Optionally, delete subfolders if you support nesting
    await pool.query('DELETE FROM folders WHERE parent_folder_id = $1', [folderId]);

    // Finally, delete the folder itself
    const result = await pool.query(
      'DELETE FROM folders WHERE id = $1 RETURNING *',
      [folderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).send('Folder not found');
    }

    res.status(200).json(result.rows[0]); // Return deleted folder
  } catch (error) {
    console.error('Error deleting folder:', error);
    res.status(500).send('Server error');
  }
});

// POST /folders/:folderId/files - Upload file to a folder
app.post('/folders/:folderId/files', async (req, res) => {
  const { folderId } = req.params;
  const { fileName, filePath } = req.body;

  try {
    // Insert the file record into the database, associating it with the folder
    const result = await pool.query(
      'INSERT INTO files (name, path, folder_id) VALUES ($1, $2, $3) RETURNING *',
      [fileName, filePath, folderId]
    );

    res.status(201).json(result.rows[0]); // Return the newly created file
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send('Server error');
  }
});


