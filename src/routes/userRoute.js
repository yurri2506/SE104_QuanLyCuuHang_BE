const express = require('express')
const router = express.Router()
const { createUser, handleLogin, getUser } = require('../controllers/userController');
const verifyToken = require('../middleware/auth');



router.post("/register", createUser);
router.post("/login", handleLogin);
router.get("/user", verifyToken, getUser);

module.exports = router