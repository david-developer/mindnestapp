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

// determine if user should see counselor nudge based on mood patterns
// returns: { shouldNudge: boolean, reason: string | null, lastDismissed: timestamp | null }
const getNudgeStatus = async (req, res) => {
  const userId = req.user.userId

  try {
    // get last 7 distinct days of check-ins, ordered newest first
    // we use DISTINCT on day to avoid counting multiple same-day check-ins as separate days
    const result = await pool.query(
      `SELECT 
         DATE_TRUNC('day', created_at) AS day,
         MIN(mood_value) AS min_mood
       FROM mood_checkins
       WHERE user_id = $1
         AND created_at >= NOW() - INTERVAL '7 days'
       GROUP BY day
       ORDER BY day DESC
       LIMIT 7`,
      [userId]
    )

    const days = result.rows.map(r => ({
      day: r.day,
      mood: Number(r.min_mood),
    }))

    // check the three trigger paths from option C
    let shouldNudge = false
    let reason = null

    // path 1: 3 consecutive days <= 2
    if (days.length >= 3) {
      const recent3 = days.slice(0, 3)
      if (recent3.every(d => d.mood <= 2)) {
        shouldNudge = true
        reason = '3 consecutive low-mood days'
      }
    }

    // path 2: 5 of last 7 days <= 2
    if (!shouldNudge && days.length >= 5) {
      const lowDays = days.filter(d => d.mood <= 2).length
      if (lowDays >= 5) {
        shouldNudge = true
        reason = '5 of 7 recent days were low'
      }
    }

    // path 3: today is 1 (Struggling) and previous day was also <= 2
    if (!shouldNudge && days.length >= 2) {
      if (days[0].mood === 1 && days[1].mood <= 2) {
        shouldNudge = true
        reason = 'today is struggling after a low day'
      }
    }

    // check if user dismissed nudge in the last 7 days
    // we'll store dismissals in a simple table - if shouldNudge but recently dismissed, suppress
    const dismissResult = await pool.query(
      `SELECT created_at FROM nudge_dismissals
       WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '7 days'
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    )

    const recentlyDismissed = dismissResult.rows.length > 0
    if (recentlyDismissed) {
      shouldNudge = false
    }

    res.json({
      shouldNudge,
      reason,
      lastDismissed: dismissResult.rows[0]?.created_at || null,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// record that user dismissed the nudge
const dismissNudge = async (req, res) => {
  const userId = req.user.userId

  try {
    await pool.query(
      `INSERT INTO nudge_dismissals (user_id) VALUES ($1)`,
      [userId]
    )
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}



module.exports = { createCheckin, getCheckins, getWeeklyMood, getStreak, getInsights, getNudgeStatus, dismissNudge }



