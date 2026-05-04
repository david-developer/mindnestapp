const pool = require('../config/db')

// create new entries
const createEntry = async (req, res) => {
  const userId = req.user.userId
  const { title, content, mood_value } = req.body

  try {
    const result = await pool.query(
      `INSERT INTO journal_entries (user_id, title, content, mood_value)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, title, content, mood_value || null]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// get entries for logged-in user
const getEntries = async (req, res) => {
    const userId = req.user.userId

    try{
        const result = await pool.query(
            `SELECT * FROM journal_entries WHERE user_id = $1
            ORDER BY created_at DESC`,
            [userId]
        )

        res.json(result.rows)
    }catch (err) {
        res.status(500).json({ error: err.message})
    }
}

// delete a journal entry by id
const deleteEntry = async (req, res) => {
    const userId = req.user.userId  
    const { id } = req.params     
  
    try {
      const result = await pool.query(
        // security check: only delete if this entry belongs to this user
        `DELETE FROM journal_entries 
         WHERE id = $1 AND user_id = $2
         RETURNING *`,
        [id, userId]
      )
  
      // if nothing was deleted, entry didn't exist or belongs to someone else
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Entry not found' })
      }
  
      res.json({ message: 'Entry deleted' })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

module.exports = { createEntry, getEntries,  deleteEntry }