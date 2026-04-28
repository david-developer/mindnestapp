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

// calculate the current consecutive-day streak for the logged-in user
const getStreak = async (req, res) => {
  const userId = req.user.userId

  try {
    // get all distinct days the user has checked in, newest first
    const result = await pool.query(
      `SELECT DISTINCT DATE_TRUNC('day', created_at) AS day
       FROM mood_checkins
       WHERE user_id = $1
       ORDER BY day DESC`,
      [userId]
    )

    const days = result.rows.map(r => new Date(r.day))

    // get today and yesterday as date-only objects for comparison
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let streak = 0

    // start from today and walk backwards through consecutive days
    for (let i = 0; i < days.length; i++) {
      const expected = new Date(today)
      expected.setDate(expected.getDate() - i)

      const checkinDay = days[i]
      checkinDay.setHours(0, 0, 0, 0)

      // allow the first day to be either today or yesterday
      // this way a user who hasn't checked in yet today doesn't lose streak
      if (i === 0) {
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        if (checkinDay.getTime() === today.getTime()) {
          streak = 1
          continue
        } else if (checkinDay.getTime() === yesterday.getTime()) {
          // reset "expected" baseline to yesterday so next iteration checks day before
          streak = 1
          today.setDate(today.getDate() - 1)
          continue
        } else {
          // neither today nor yesterday = no current streak
          break
        }
      }

      // for subsequent days, check if it matches the expected previous day
      if (checkinDay.getTime() === expected.getTime()) {
        streak++
      } else {
        break
      }
    }

    // also return total count for the badges card
    const totalResult = await pool.query(
      `SELECT COUNT(*) AS total FROM mood_checkins WHERE user_id = $1`,
      [userId]
    )

    res.json({
      streak,
      total_checkins: Number(totalResult.rows[0].total),
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// returns full insights bundle: monthly trend, top tags, activity by day
const getInsights = async (req, res) => {
  const userId = req.user.userId

  try {
    // monthly trend - last 30 days with daily averages
    const monthlyResult = await pool.query(
      `SELECT 
         DATE_TRUNC('day', created_at) AS day,
         ROUND(AVG(mood_value)::numeric, 2) AS avg_mood,
         COUNT(*) AS checkin_count
       FROM mood_checkins
       WHERE user_id = $1
         AND created_at >= NOW() - INTERVAL '30 days'
       GROUP BY day
       ORDER BY day ASC`,
      [userId]
    )

    // top tags - count occurrences across all check-ins
    // UNNEST flattens the tags array so we can count individual tags
    const tagsResult = await pool.query(
      `SELECT 
         tag,
         COUNT(*) AS count
       FROM mood_checkins, UNNEST(tags) AS tag
       WHERE user_id = $1
       GROUP BY tag
       ORDER BY count DESC
       LIMIT 8`,
      [userId]
    )

    // activity by day of week - which days does the user check in most
    // EXTRACT(DOW) returns 0=Sunday, 1=Monday, ..., 6=Saturday
    const activityResult = await pool.query(
      `SELECT 
         EXTRACT(DOW FROM created_at)::int AS day_of_week,
         COUNT(*) AS count,
         ROUND(AVG(mood_value)::numeric, 2) AS avg_mood
       FROM mood_checkins
       WHERE user_id = $1
       GROUP BY day_of_week
       ORDER BY day_of_week ASC`,
      [userId]
    )

    // overall stats for the page header
    const statsResult = await pool.query(
      `SELECT 
         COUNT(*) AS total_checkins,
         ROUND(AVG(mood_value)::numeric, 2) AS overall_avg
       FROM mood_checkins
       WHERE user_id = $1`,
      [userId]
    )

    res.json({
      monthly: monthlyResult.rows,
      topTags: tagsResult.rows,
      activity: activityResult.rows,
      stats: statsResult.rows[0],
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = { createCheckin, getCheckins, getWeeklyMood, getStreak, getInsights }



