const express = require('express');
const router = express.Router();
const ticketController = require('./ticket.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

// All routes require authentication
router.use(protect);

// Employee routes
router.post('/', ticketController.createTicket);
router.get('/my', ticketController.getMyTickets);
router.post('/:id/respond', ticketController.addResponse);

// Admin routes
router.get('/', authorize('SUPER_ADMIN', 'IT_ADMIN', 'HR_MANAGER'), ticketController.getAllTickets);
router.put('/:id', authorize('SUPER_ADMIN', 'IT_ADMIN', 'HR_MANAGER'), ticketController.updateTicket);

module.exports = router;
