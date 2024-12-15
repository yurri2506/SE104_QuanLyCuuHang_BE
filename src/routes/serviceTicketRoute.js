
const express = require('express');
const { createServiceTicket, getAllServiceTickets, getServiceTicketById } = require('../controllers/serviceTicketController');
const verifyToken = require('../middleware/auth');

const router = express.Router();

router.post('/', verifyToken, createServiceTicket);
router.get('/', verifyToken, getAllServiceTickets);
router.get('/:id', verifyToken, getServiceTicketById);

module.exports = router;