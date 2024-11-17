const connection = require('../config/database')

const createUser = async (req, res) => {
    const { username, password } = req.body
    try {
        const [rows] = await connection.query(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, password])
        return res.status(200).json({ message: "User created successfully" })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

const handleLogin = async (req, res) => {
    const { username, password } = req.body
    try {
        const [rows] = await connection.query(`SELECT * FROM users WHERE username = ? AND password = ?`, [username, password])
        if (rows.length > 0) {
            return res.status(200).json({ message: "Login success" })
        } else {
            return res.status(401).json({ message: "Login failed" })
        }
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

const getUser = async (req, res) => {
    try {
        const [rows] = await connection.query(`SELECT * FROM users`)
        return res.status(200).json(rows)
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

module.exports = { createUser, handleLogin, getUser }