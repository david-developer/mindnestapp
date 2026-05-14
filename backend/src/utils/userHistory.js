const pool = require('../config/db')

const MOOD_LABELS = {
  1: 'Struggling', 2: 'Low', 3: 'Okay',
  4: 'Good', 5: 'Happy', 6: 'Amazing',
}

// fetch recent context for a user
// returns last 5 check-ins + last 3 journal entries as a formatted text block
// designed to be small enough to fit comfortably within token budget
const buildUserHistory = async (userId) => {
  try {
    // recent check-ins
    const checkinsResult = await pool.query(
      `SELECT mood_value, tags, note, created_at
       FROM mood_checkins
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 5`,
      [userId]
    )

    // recent journal entries (truncate content to keep token budget tight)
    const journalsResult = await pool.query(
      `SELECT title, content, mood_value, created_at
       FROM journal_entries
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 3`,
      [userId]
    )

    // if user has no history, return empty string - prompt will not include any context
    if (checkinsResult.rows.length === 0 && journalsResult.rows.length === 0) {
      return ''
    }

    // build a human-readable summary
    let history = ''

    if (checkinsResult.rows.length > 0) {
      history += 'Recent mood check-ins (newest first):\n'
      checkinsResult.rows.forEach((row, i) => {
        const daysAgo = Math.floor(
          (new Date() - new Date(row.created_at)) / (1000 * 60 * 60 * 24)
        )
        const when = daysAgo === 0 ? 'today' : daysAgo === 1 ? 'yesterday' : `${daysAgo} days ago`
        const moodLabel = MOOD_LABELS[row.mood_value] || 'Unknown'
        const tagsText = row.tags && row.tags.length > 0
          ? ` Tags: ${row.tags.join(', ')}.` : ''
        const noteText = row.note && row.note.trim()
          ? ` Note: "${row.note.trim()}"` : ''
        history += `- ${when}: ${moodLabel} (${row.mood_value}/6).${tagsText}${noteText}\n`
      })
      history += '\n'
    }

    if (journalsResult.rows.length > 0) {
      history += 'Recent journal entries (newest first):\n'
      journalsResult.rows.forEach((entry) => {
        const daysAgo = Math.floor(
          (new Date() - new Date(entry.created_at)) / (1000 * 60 * 60 * 24)
        )
        const when = daysAgo === 0 ? 'today' : daysAgo === 1 ? 'yesterday' : `${daysAgo} days ago`
        // truncate to first 250 chars to control token usage
        const preview = entry.content.length > 250
          ? entry.content.substring(0, 250) + '...'
          : entry.content
        const title = entry.title || 'Untitled'
        history += `- ${when} ("${title}"): ${preview}\n`
      })
    }

    return history
  } catch (err) {
    console.error('Failed to build user history:', err.message)
    return ''  // fail safe - no history rather than error
  }
}

module.exports = { buildUserHistory }