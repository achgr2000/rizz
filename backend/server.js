require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;


// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Basic route for testing
app.get('/', (req, res) => {
    res.send('Reply Suggestions API is running');
});

// Start server


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});