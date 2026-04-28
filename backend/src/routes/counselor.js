const express = require('express')
const router = express.Router()
const {
  listCounselors,
  getCounselor,
  requestContact,
  getMyRequests,
} = require('../controllers/counselorController')
const { protect } = require('../middleware/authMiddleware')

router.get('/', protect, listCounselors)
router.get('/my-requests', protect, getMyRequests)
router.get('/:id', protect, getCounselor)
router.post('/request', protect, requestContact)

module.exports = router