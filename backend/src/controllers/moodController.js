const pool = require('../config/db')

// save a new mood check-in for the logged-in user
const createCheckin = async (req, res) => {
  // user_id comes from the JWT token via protect middleware
  const userId = req.user.userId
  const { mood_value, tags, note } = req.body

  try {
    const result = await pool.query(
      `INSERT INTO mood_checkins (user_id, mood_value, tags, note)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, mood_value, tags, note]
    )

    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// get all check-ins for the logged-in user
const getCheckins = async (req, res) => {
  const userId = req.user.userId

  try {
    const result = await pool.query(
      `SELECT * FROM mood_checkins 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    )

    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// get last 7 days of check-ins with daily averages
const getWeeklyMood = async (req, res) => {
  const userId = req.user.userId

  try {
    const result = await pool.query(
      // date_trunc groups checkins by day, AVD dets the daily average
      `SELECT
        DATE_TRUNC('day', created_at) AS day, 
        ROUND(AVG(mood_value)::numeric, 2) AS avg_mood,
        COUNT(*) AS checkin_count
      FROM mood_checkins
      WHERE user_id = $1
        AND created_at >= NOW() - INTERVAL '7 days'
      GROUP BY day
      ORDER BY day ASC`,
      [userId]
    )

    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message})
  }
}

module.exports = { createCheckin, getCheckins, getWeeklyMood }