const pool = require('../config/db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


// sign up function
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

// login function

const login = async (req, res) => {
    const { email, password } = req.body

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        )
        if (result.rows.length === 0){
            return res.status(401).json({ error: 'Invalid Credentials' })
        }

        const user = result.rows[0]
        const validPassword = await bcrypt.compare(password, user.password)

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid Credentials'})
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '7d'}
        )
        res.json({ token, user: {id: user.id, name: user.name, email: user.email }} )
    }catch (err) {
        res.status(500).json({ error: err.message})
    }
}

module.exports = { signup, login }