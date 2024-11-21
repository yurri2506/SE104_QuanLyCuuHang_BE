const UserService = require('../services/userService');

const createUser = async (req, res) => {
    const { username, password, role } = req.body;
    try {
        const result = await UserService.createUser(username, password, role);
        return res.status(201).json({ 
            message: "User created successfully", 
            userId: result.insertId 
        });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const handleLogin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const userData = await UserService.login(username, password);
        return res.status(200).json({ 
            message: "Login success",
            ...userData
        });
    } catch (error) {
        return res.status(401).json({ message: error.message });
    }
};

const getUser = async (req, res) => {
    try {
        const users = await UserService.getAllUsers();
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = { createUser, handleLogin, getUser };