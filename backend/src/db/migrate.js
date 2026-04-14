const pool = require('../config/db')

const createTables = async () => {
    try {
        // user table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users(
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                password TEXT NOT NULL,
                date_of_birth DATE,
                created_at TIMESTAMP DEFAULT NOW()
             )
        `)
        console.log('User Table Created')
        
        // mood_checkins table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS mood_checkins (
            id SERIAL PRIMARY KEY, 
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            mood_value INTEGER NOT NULL CHECK (mood_value BETWEEN 1 AND 6),
            tags TEXT[],
            note TEXT,
            created_at TIMESTAMP DEFAULT NOW()
            )
        `)
        console.log('✅ Mood checkins table created')
        


        process.exit(0)
    } catch (err)   {
        console.error('Migration Failed:', err.message)
        process.exit(1)
    }
    
    
}

createTables()