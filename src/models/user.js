const { connection } = require('../config/database');

class User {
    constructor(username, password) {
        this.username = username;
        this.password = password;
    }

    static async create(username, password) {
        const query = 'INSERT INTO TAIKHOAN (TenTaiKhoan, MatKhau) VALUES (?, ?)';
        const conn = await connection.getConnection();
        try {
            const [result] = await conn.query(query, [username, password]);
            return result;
        } finally {
            conn.release();
        }
    }

    static async findByUsername(username) {
        const query = 'SELECT * FROM TAIKHOAN WHERE username = ?';
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
        const query = 'SELECT * FROM users WHERE id = ?';
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