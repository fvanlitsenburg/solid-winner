const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

// Import Routes
const folderRoutes = require('./routes/folders');
const fileRoutes = require('./routes/files');
const formRoutes = require('./routes/forms');

// Middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // For parsing application/json

// Static files (optional)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use Routes
app.use('/folders', folderRoutes);
app.use('/files', fileRoutes);
app.use('/forms', formRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
