const express = require('express')
const router = express.Router()
const { createCheckin, getCheckins, getWeeklyMood, getStreak, getInsights, getNudgeStatus, dismissNudge } = require('../controllers/moodController')
const { protect } = require('../middleware/authMiddleware')


//all mood routes are protected - must be logged in
router.post('/checkin', protect, createCheckin)
router.get('/checkins', protect, getCheckins)
router.get('/weekly', protect, getWeeklyMood)
router.get('/streak', protect, getStreak)
router.get('/insights', protect, getInsights)
router.get('/nudge', protect, getNudgeStatus)
router.post('/nudge/dismiss', protect, dismissNudge)

module.exports = router