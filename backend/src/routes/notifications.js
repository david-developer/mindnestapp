const express = require('express')
const router = express.Router()
const {
  listNotifications,
  markRead,
  markAllRead,
} = require('../controllers/notificationController')
const { protect } = require('../middleware/authMiddleware')

router.get('/', protect, listNotifications)
router.put('/:id/read', protect, markRead)
router.put('/read-all', protect, markAllRead)

module.exports = router