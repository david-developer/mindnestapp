const express = require('express')
const router = express.Router()
const { createCheckin, getCheckins } = require('../controllers/moodController')
const { protect } = require('../middleware/authMiddleware')

//all mood routes are protected - must be logged in
router.post('/checkin', protect, createCheckin)
router.get('/checkins', protect, getCheckins)

module.exports = router