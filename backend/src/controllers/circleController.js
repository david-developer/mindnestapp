const pool = require('../config/db')

// search users by email - used when adding a friend
// returns id, name, email but only if they aren't the current user
const searchUserByEmail = async (req, res) => {
  const userId = req.user.userId
  const { email } = req.query

  if (!email || email.trim().length < 3) {
    return res.json([])
  }

  try {
    const result = await pool.query(
      `SELECT id, name, email FROM users 
       WHERE email ILIKE $1 AND id != $2
       LIMIT 5`,
      [`%${email.trim()}%`, userId]
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// send a friend request from current user to target
const sendFriendRequest = async (req, res) => {
  const userId = req.user.userId
  const { addressee_id } = req.body

  if (!addressee_id || addressee_id === userId) {
    return res.status(400).json({ error: 'Invalid friend request' })
  }

  try {
    // check if any relationship already exists in either direction
    const existing = await pool.query(
      `SELECT * FROM friendships
       WHERE (requester_id = $1 AND addressee_id = $2)
          OR (requester_id = $2 AND addressee_id = $1)`,
      [userId, addressee_id]
    )

    if (existing.rows.length > 0) {
      return res.status(400).json({ 
        error: 'A friendship or request already exists with this user' 
      })
    }

    // create the request with status 'pending'
    const result = await pool.query(
      `INSERT INTO friendships (requester_id, addressee_id, status)
       VALUES ($1, $2, 'pending')
       RETURNING *`,
      [userId, addressee_id]
    )

    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// accept or reject a pending friend request
const respondToRequest = async (req, res) => {
  const userId = req.user.userId
  const { id } = req.params
  const { action } = req.body  // 'accept' or 'reject'

  if (!['accept', 'reject'].includes(action)) {
    return res.status(400).json({ error: 'Invalid action' })
  }

  const newStatus = action === 'accept' ? 'accepted' : 'rejected'

  try {
    // only the addressee can respond to a pending request
    const result = await pool.query(
      `UPDATE friendships
       SET status = $1, updated_at = NOW()
       WHERE id = $2 AND addressee_id = $3 AND status = 'pending'
       RETURNING *`,
      [newStatus, id, userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' })
    }

    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// get all accepted friends for the current user
const getFriends = async (req, res) => {
  const userId = req.user.userId

  try {
    // friend can be either side of the relationship
    const result = await pool.query(
      `SELECT 
         u.id, u.name, u.email,
         f.created_at AS friends_since
       FROM friendships f
       JOIN users u ON (
         (f.requester_id = $1 AND u.id = f.addressee_id) OR
         (f.addressee_id = $1 AND u.id = f.requester_id)
       )
       WHERE f.status = 'accepted'
       ORDER BY f.updated_at DESC`,
      [userId]
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// get pending requests where current user is the addressee
const getPendingRequests = async (req, res) => {
  const userId = req.user.userId

  try {
    const result = await pool.query(
      `SELECT 
         f.id, f.created_at,
         u.id AS user_id, u.name, u.email
       FROM friendships f
       JOIN users u ON u.id = f.requester_id
       WHERE f.addressee_id = $1 AND f.status = 'pending'
       ORDER BY f.created_at DESC`,
      [userId]
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// share a mood snapshot to the user's circle
const shareMood = async (req, res) => {
  const userId = req.user.userId
  const { mood_value, message } = req.body

  if (!mood_value) {
    return res.status(400).json({ error: 'mood_value is required' })
  }

  try {
    const result = await pool.query(
      `INSERT INTO mood_shares (user_id, mood_value, message)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, mood_value, message || null]
    )

    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// get the circle feed - shares from all accepted friends from last 7 days
const getCircleFeed = async (req, res) => {
  const userId = req.user.userId

  try {
    // join shares to users, filtered to people who are accepted friends
    const result = await pool.query(
      `SELECT 
         ms.id, ms.mood_value, ms.message, ms.created_at,
         u.id AS user_id, u.name, u.email
       FROM mood_shares ms
       JOIN users u ON u.id = ms.user_id
       WHERE ms.user_id IN (
         SELECT 
           CASE 
             WHEN f.requester_id = $1 THEN f.addressee_id
             ELSE f.requester_id
           END
         FROM friendships f
         WHERE f.status = 'accepted'
           AND ($1 IN (f.requester_id, f.addressee_id))
       )
       AND ms.created_at >= NOW() - INTERVAL '7 days'
       AND ms.id NOT IN (
        SELECT share_id FROM mood_share_hides WHERE user_id = $1
      )
       ORDER BY ms.created_at DESC
       LIMIT 30`,
      [userId]
    )

    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// list current user's own mood shares (My Shares tab)
const getMyShares = async (req, res) => {
  const userId = req.user.userId

  try {
    const result = await pool.query(
      `SELECT id, mood_value, message, created_at
       FROM mood_shares
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// delete one of the user's own shares (hard delete - removes for everyone)
const deleteMyShare = async (req, res) => {
  const userId = req.user.userId
  const { id } = req.params

  try {
    const result = await pool.query(
      `DELETE FROM mood_shares
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Share not found' })
    }

    res.json({ message: 'Share deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// hide a friend's share from the current user's feed (soft hide)
const hideShare = async (req, res) => {
  const userId = req.user.userId
  const { id } = req.params

  try {
    // upsert pattern - if already hidden, no error
    await pool.query(
      `INSERT INTO mood_share_hides (user_id, share_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, share_id) DO NOTHING`,
      [userId, id]
    )
    res.json({ message: 'Share hidden from feed' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = {
  searchUserByEmail,
  sendFriendRequest,
  respondToRequest,
  getFriends,
  getPendingRequests,
  shareMood,
  getCircleFeed,
  getMyShares,
  deleteMyShare,
  hideShare,
}