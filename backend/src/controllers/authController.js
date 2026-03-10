const pool = require('../config/db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const signup = async (req, res) => {
    const { name, email, password, date_of_birth } = req.body

    try {
        const hashedPassword = await bcrypt.hash(password, 10)

        const result = await pool.query(
            `INSERT INTO users (name, email, password, date_of_birth)
            VALUES ($1, $2, $3, $4) RETURNING id, name, email`,
            [name, email, hashedPassword, date_of_birth]
        )

        const user = result.rows[0]
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )

        res.status(201).json({ token, user})
    }   catch (err) {
        res.status(500).json({ error: err.message})
    }
}

module.exports = {signup}