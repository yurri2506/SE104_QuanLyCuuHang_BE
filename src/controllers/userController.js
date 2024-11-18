const User = require('../models/user');
const bcrypt = require('bcrypt');

const createUser = async (req, res) => {
    const { username, password, role } = req.body;
    
    // Validate role
    const validRoles = ['admin', 'seller', 'warehouse'];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role. Must be admin, seller, or warehouse" });
    }

    try {
        const result = await User.create(username, password, role);
        return res.status(200).json({ message: "User created successfully", userId: result.insertId });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const handleLogin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findByUsername(username);
        if (user && await bcrypt.compare(password, user.MatKhau)) {
            return res.status(200).json({ 
                message: "Login success",
                role: user.Role,
                userId: user.MaTaiKhoan,
                username: user.TenTaiKhoan
            });
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