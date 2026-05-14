const pool = require('../config/db')

// creates a notification for a user
// used internally by other controllers to fire events
// fails silently - a notification failure should never break the main flow
const createNotification = async ({ user_id, type, title, body, link }) => {
  try {
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, body, link)
       VALUES ($1, $2, $3, $4, $5)`,
      [user_id, type, title, body || null, link || null]
    )

    // cleanup old notifications - keep only the most recent 30 per user
    // also remove anything older than 30 days
    await pool.query(
      `DELETE FROM notifications 
       WHERE user_id = $1 
         AND (
           created_at < NOW() - INTERVAL '30 days'
           OR id NOT IN (
             SELECT id FROM notifications 
             WHERE user_id = $1 
             ORDER BY created_at DESC 
             LIMIT 30
           )
         )`,
      [user_id]
    )
  } catch (err) {
    // we never want a notification failure to break the main action
    console.error('Failed to create notification:', err.message)
  }
}

module.exports = { createNotification }