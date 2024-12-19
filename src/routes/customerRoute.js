
const express = require('express');
const { createCustomer, updateCustomer, deleteCustomer, getAllCustomers, getCustomerById } = require('../controllers/customerController');
const verifyToken = require('../middleware/auth');

const router = express.Router();

router.post('/', verifyToken, createCustomer);
router.put('/:id', verifyToken, updateCustomer);
router.delete('/:id', verifyToken, deleteCustomer);
router.get('/', verifyToken, getAllCustomers);
router.get('/:id', verifyToken, getCustomerById);

module.exports = router;