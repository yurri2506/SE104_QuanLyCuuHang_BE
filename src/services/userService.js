const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class UserService {
    static generateToken(userData) {
        return jwt.sign(userData, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });
    }

    static generateRefreshToken(userData) {
        return jwt.sign(userData, process.env.JWT_REFRESH_SECRET, {
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
        });
    }

    static async createUser(username, password, role) {
        const existingUser = await User.findOne({ where: { TenTaiKhoan: username } });
        if (existingUser) {
            throw new Error('Username already exists');
        }

        const validRoles = ['admin', 'seller', 'warehouse'];
        if (!validRoles.includes(role)) {
            throw new Error('Invalid role');
        }

        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        return await User.create({
            TenTaiKhoan: username,
            MatKhau: hashedPassword,
            Role: role
        });
    }

    static async login(username, password) {
        const user = await User.findOne({ where: { TenTaiKhoan: username } });
        
        if (!user) {
            throw new Error('User not found');
        }

        const isValidPassword = await bcrypt.compare(password, user.MatKhau);
        if (!isValidPassword) {
            throw new Error('Invalid password');
        }

        const userData = {
            userId: user.MaTaiKhoan,
            username: user.TenTaiKhoan,
            role: user.Role
        };

        return {
            userId: user.MaTaiKhoan,
            username: user.TenTaiKhoan,
            role: user.Role,
            accessToken: UserService.generateToken(userData),
            refreshToken: UserService.generateRefreshToken(userData)
        };
    }

    static async findById(id) {
        return await User.findByPk(id);
    }

    static async getAllUsers() {
        return await User.findAll({
            attributes: ['MaTaiKhoan', 'TenTaiKhoan', 'Role']
        });
    }
}

module.exports = UserService;