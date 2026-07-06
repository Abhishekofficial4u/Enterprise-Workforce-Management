const express = require('express');
const router = express.Router();
const aiController = require('./ai.controller');
const { protect } = require('../../middlewares/auth.middleware');

router.use(protect); // Ensure only logged in users can chat

router.post('/chat', aiController.processChat);

module.exports = router;
