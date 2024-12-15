const express = require('express');
const userRoute = require('./userRoute');
const customerRoute = require('./customerRoute');
const serviceTicketRoute = require('./serviceTicketRoute');

const router = express.Router();

// Define route prefixes
router.use('/users', userRoute);
router.use('/customers', customerRoute);
router.use('/services', serviceTicketRoute);

module.exports = router;