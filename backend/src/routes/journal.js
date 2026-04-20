const express = require('express')
const router = express.Router()
const { createEntry, getEntries, deleteEntry } = require('../controllers/journalController')
const { protect } = require('../middleware/authMiddleware')

router.post('/entry', protect, createEntry)
router.get('/entries', protect, getEntries)
router.delete('/entry/:id', protect, deleteEntry)

module.exports = router