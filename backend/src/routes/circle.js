const express = require('express')
const router = express.Router()
const {
  searchUserByEmail,
  sendFriendRequest,
  respondToRequest,
  getFriends,
  getPendingRequests,
  shareMood,
  getCircleFeed,
  getMyShares,
  deleteMyShare,
  hideShare,
} = require('../controllers/circleController')
const { protect } = require('../middleware/authMiddleware')

// search and friend management
router.get('/search', protect, searchUserByEmail)
router.post('/request', protect, sendFriendRequest)
router.put('/request/:id', protect, respondToRequest)

// list endpoints
router.get('/friends', protect, getFriends)
router.get('/requests', protect, getPendingRequests)

// shares + feed
router.post('/share', protect, shareMood)
router.get('/feed', protect, getCircleFeed)
router.get('/my-shares', protect, getMyShares)
router.delete('/share/:id', protect, deleteMyShare)
router.post('/feed/hide/:id', protect, hideShare)

module.exports = router