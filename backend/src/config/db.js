const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // SSL required for Railway/production PostgreSQL connections
  // rejectUnauthorized: false works for Railway's self-signed cert setup
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
})

module.exports = pool