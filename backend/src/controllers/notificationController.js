const pool = require('../config/db')

// list current user's notifications (newest first, capped at 30)
const listNotifications = async (req, res) => {
  const userId = req.user.userId

  try {
    const result = await pool.query(
      `SELECT id, type, title, body, link, read, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 30`,
      [userId]
    )

    // also return unread count for the badge
    const unreadResult = await pool.query(
      `SELECT COUNT(*) AS unread 
       FROM notifications 
       WHERE user_id = $1 AND read = FALSE`,
      [userId]
    )

    res.json({
      notifications: result.rows,
      unread: Number(unreadResult.rows[0].unread),
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// mark a single notification as read
const markRead = async (req, res) => {
  const userId = req.user.userId
  const { id } = req.params

  try {
    await pool.query(
      `UPDATE notifications 
       SET read = TRUE 
       WHERE id = $1 AND user_id = $2`,
      [id, userId]
    )
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// mark all notifications as read (when user opens the dropdown)
const markAllRead = async (req, res) => {
  const userId = req.user.userId

  try {
    await pool.query(
      `UPDATE notifications 
       SET read = TRUE 
       WHERE user_id = $1 AND read = FALSE`,
      [userId]
    )
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = {
  listNotifications,
  markRead,
  markAllRead,
}