const User = require('../models/user');

const createUser = async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await User.create(username, password);
        return res.status(200).json({ message: "User created successfully", userId: result.insertId });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const handleLogin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findByUsername(username);
        if (user && user.password === password) {
            return res.status(200).json({ message: "Login success" });
        } else {
            return res.status(401).json({ message: "Login failed" });
        }
    } catch (error) {   
        return res.status(500).json({ message: error.message });
    }
};

const getUser = async (req, res) => {
    try {
        const users = await User.findAll();
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = { createUser, handleLogin, getUser };