const express = require('express')
const router = express.Router()
const { generateReflection } = require('../controllers/aiController')
const { protect } = require('../middleware/authMiddleware')

router.post('/reflect', protect, generateReflection)

module.exports = router