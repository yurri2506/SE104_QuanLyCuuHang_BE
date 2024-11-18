const { connection } = require('../config/database');
const bcrypt = require('bcrypt');

class User {
    constructor(username, password) {
        this.username = username;
        this.password = password;
    }

    static async create(username, password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO TAIKHOAN (TenTaiKhoan, MatKhau) VALUES (?, ?)';
        const conn = await connection.getConnection();
        try {
            const [result] = await conn.query(query, [username, hashedPassword]);
            return result;
        } finally {
            conn.release();
        }
    }

    static async findByUsername(username) {
        const query = 'SELECT * FROM TAIKHOAN WHERE TenTaiKhoan = ?';
        const conn = await connection.getConnection();
        try {
            const [rows] = await conn.query(query, [username]);
            if (rows.length > 0) {
                return rows[0];
            }
            return null;
        } finally {
            conn.release();
        }
    }

    static async findById(id) {
        const query = 'SELECT * FROM TAIKHOAN WHERE MaTaiKhoan = ?';
        const conn = await connection.getConnection();
        try {
            const [rows] = await conn.query(query, [id]);
            if (rows.length > 0) {
                return rows[0];
            }
            return null;
        } finally {
            conn.release();
        }
    }
}

module.exports = User;