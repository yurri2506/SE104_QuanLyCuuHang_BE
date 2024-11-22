const express = require('express')
const router = express.Router()
const { createUser, handleLogin, getUser } = require('../controllers/userController');
const auth = require('../middleware/auth');

router.post("/register", createUser);
router.post("/login", handleLogin);
router.get("/user", getUser);

module.exports = router