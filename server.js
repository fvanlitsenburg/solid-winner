const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

// Import Routes
const folderRoutes = require('./routes/folders');
const fileRoutes = require('./routes/files');
const formRoutes = require('./routes/forms');
const runsRoutes = require('./routes/runs');  // Import the routes

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
app.use('/runs', runsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
