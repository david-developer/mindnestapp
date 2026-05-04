const express = require('express')
const router = express.Router()
const { generateReflection, reflectOnJournal } = require('../controllers/aiController')
const { protect } = require('../middleware/authMiddleware')

router.post('/reflect', protect, generateReflection)
router.post('/reflect-journal', protect, reflectOnJournal)

module.exports = router