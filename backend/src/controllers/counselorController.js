const pool = require('../config/db')

// list all counselors with optional filtering by specialization or language
const listCounselors = async (req, res) => {
  const { specialization, language, accepting_only } = req.query

  try {
    let query = 'SELECT * FROM counselors WHERE 1=1'
    const params = []

    if (specialization) {
      params.push(specialization)
      query += ` AND $${params.length} = ANY(specializations)`
    }

    if (language) {
      params.push(language)
      query += ` AND $${params.length} = ANY(languages)`
    }

    if (accepting_only === 'true') {
      query += ' AND accepting_new = TRUE'
    }

    query += ' ORDER BY accepting_new DESC, name ASC'

    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// get single counselor details by id
const getCounselor = async (req, res) => {
  const { id } = req.params

  try {
    const result = await pool.query(
      'SELECT * FROM counselors WHERE id = $1',
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Counselor not found' })
    }

    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// student requests contact with a counselor
const requestContact = async (req, res) => {
  const userId = req.user.userId
  const { counselor_id, message } = req.body

  if (!counselor_id) {
    return res.status(400).json({ error: 'counselor_id required' })
  }

  try {
    // verify counselor exists and is accepting new students
    const counselor = await pool.query(
      'SELECT id, accepting_new FROM counselors WHERE id = $1',
      [counselor_id]
    )

    if (counselor.rows.length === 0) {
      return res.status(404).json({ error: 'Counselor not found' })
    }
    if (!counselor.rows[0].accepting_new) {
      return res.status(400).json({ 
        error: 'This counselor is not accepting new students at the moment' 
      })
    }

    // prevent duplicate active requests to same counselor
    const existing = await pool.query(
      `SELECT id FROM counselor_requests 
       WHERE user_id = $1 AND counselor_id = $2 AND status = 'pending'`,
      [userId, counselor_id]
    )

    if (existing.rows.length > 0) {
      return res.status(400).json({
        error: 'You already have a pending request with this counselor',
      })
    }

    const result = await pool.query(
      `INSERT INTO counselor_requests (user_id, counselor_id, message, status)
       VALUES ($1, $2, $3, 'pending')
       RETURNING *`,
      [userId, counselor_id, message || null]
    )

    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// list current user's contact requests with counselor info joined
const getMyRequests = async (req, res) => {
  const userId = req.user.userId

  try {
    const result = await pool.query(
      `SELECT 
         cr.id, cr.message, cr.status, cr.created_at,
         c.id AS counselor_id, c.name, c.title, c.avatar_color
       FROM counselor_requests cr
       JOIN counselors c ON c.id = cr.counselor_id
       WHERE cr.user_id = $1
       ORDER BY cr.created_at DESC`,
      [userId]
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = {
  listCounselors,
  getCounselor,
  requestContact,
  getMyRequests,
}