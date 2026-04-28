const express = require('express')
const router = express.Router()
const pool = require('../config/db')
const { signup, login, getProfile } = require('../controllers/authController')
const { protect } = require('../middleware/authMiddleware')


router.get('/me', protect, async (req, res) => {
    const result = await pool.query(
        'SELECT id, name, email FROM users WHERE id = $1',
        [req.user.userId]
    )
    res.json(result.rows[0])
})

router.post('/signup', signup)
router.post('/login', login)
router.get('/profile', protect, getProfile)



module.exports = router