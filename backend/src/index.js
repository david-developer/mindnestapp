const express = require('express')
const cors = require('cors')
const pool = require('./config/db')
const authRoutes = require('./routes/auth')

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)

app.get('/', (req, res) =>{
    res.json({message: 'MindNest API is running'})
})

// database health check
app.get('/health', async (req, res) => {
    try{
        await pool.query('SELECT 1')
        res.json({ database: 'connected'})
    }   catch(err) {
        res.status(500).json({ database: 'disconnected', error: err.message })
    }
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })