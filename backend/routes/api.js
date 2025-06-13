const express = require('express');
const router = express.Router();
// Use the OpenRouter controller
const openRouterController = require('../controllers/openRouterController');

// Route to generate reply suggestions
router.post('/generate', openRouterController.generateReplies);

module.exports = router;