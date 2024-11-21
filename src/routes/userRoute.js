const express = require('express');
const { createUser, handleLogin, getUser } = require('../controllers/userController');
const verifyToken = require('../middleware/auth');

const routerAPI = express.Router();

routerAPI.post("/register", createUser);
routerAPI.post("/login", handleLogin);
routerAPI.get("/user", verifyToken, getUser);

module.exports = routerAPI;