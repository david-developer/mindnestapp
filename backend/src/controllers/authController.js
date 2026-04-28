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

// returns user info + aggregated stats for profile page
const getProfile = async (req, res) => {
    const userId = req.user.userId
  
    try {
      // user basic info
      const userResult = await pool.query(
        'SELECT id, name, email, date_of_birth, created_at FROM users WHERE id = $1',
        [userId]
      )
  
      // aggregated stats
      const statsResult = await pool.query(
        `SELECT 
           (SELECT COUNT(*) FROM mood_checkins WHERE user_id = $1) AS total_checkins,
           (SELECT COUNT(*) FROM journal_entries WHERE user_id = $1) AS total_entries,
           (SELECT COUNT(DISTINCT DATE_TRUNC('day', created_at)) 
              FROM mood_checkins WHERE user_id = $1) AS active_days`,
        [userId]
      )
  
      res.json({
        user: userResult.rows[0],
        stats: {
          total_checkins: Number(statsResult.rows[0].total_checkins),
          total_entries: Number(statsResult.rows[0].total_entries),
          active_days: Number(statsResult.rows[0].active_days),
        },
      })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }
  
  module.exports = { signup, login, getProfile }

