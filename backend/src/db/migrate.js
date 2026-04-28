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
        
        //journal_entries table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS journal_entries (
              id SERIAL PRIMARY KEY,
              user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
              title TEXT,
              content TEXT NOT NULL,
              checkin_id INTEGER REFERENCES mood_checkins(id) ON DELETE SET NULL,
              created_at TIMESTAMP DEFAULT NOW()
            )
          `)
          console.log('✅ Journal entries table created')

        // friendships - tracks friend relationships and their state
        await pool.query(`
            CREATE TABLE IF NOT EXISTS friendships (
            id SERIAL PRIMARY KEY,
            requester_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            addressee_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            status VARCHAR(20) NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'accepted', 'rejected')),
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW(),
            UNIQUE(requester_id, addressee_id)
            )
         `)
        console.log('✅ Friendships table created')
  
        // mood_shares - copy of a check-in shared to the user's circle
         // stores a snapshot rather than referencing checkin so privacy is permanent
        await pool.query(`
            CREATE TABLE IF NOT EXISTS mood_shares (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            mood_value INTEGER NOT NULL CHECK (mood_value BETWEEN 1 AND 6),
            message TEXT,
            created_at TIMESTAMP DEFAULT NOW()
            )
        `)
        console.log('✅ Mood shares table created')

        // counselors - directory of mental health professionals
        // students can browse and request contact
        await pool.query(`
            CREATE TABLE IF NOT EXISTS counselors (
            id SERIAL PRIMARY KEY,
            name VARCHAR(150) NOT NULL,
            title VARCHAR(150),
            specializations TEXT[],
            languages TEXT[],
            bio TEXT,
            email VARCHAR(150),
            phone VARCHAR(50),
            location VARCHAR(150),
            accepting_new BOOLEAN DEFAULT TRUE,
            avatar_color VARCHAR(20) DEFAULT '#3AA76D',
            created_at TIMESTAMP DEFAULT NOW()
            )
        `)
        console.log('✅ Counselors table created')
        
        // counselor_requests - tracks when a student asks to be contacted
        await pool.query(`
            CREATE TABLE IF NOT EXISTS counselor_requests (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            counselor_id INTEGER REFERENCES counselors(id) ON DELETE CASCADE,
            message TEXT,
            status VARCHAR(20) NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'contacted', 'closed')),
            created_at TIMESTAMP DEFAULT NOW()
            )
        `)
        console.log('✅ Counselor requests table created')


        process.exit(0)
    } catch (err)   {
        console.error('Migration Failed:', err.message)
        process.exit(1)
    }
    
        
    
}

createTables()