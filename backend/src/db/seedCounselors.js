const pool = require('../config/db')

// realistic Turkish-context counselors for the prototype
const COUNSELORS = [
  {
    name: 'Dr. Ayşe Demir',
    title: 'Clinical Psychologist',
    specializations: ['anxiety', 'academic stress', 'depression'],
    languages: ['Turkish', 'English'],
    bio: 'Specializing in university student mental health for 12 years. Cognitive Behavioral Therapy approach with a warm, collaborative style.',
    email: 'aysedemir@example.com',
    phone: '+90 212 555 0101',
    location: 'Istanbul, Turkey',
    avatar_color: '#3AA76D',
  },
  {
    name: 'Mehmet Kaya, LCSW',
    title: 'Licensed Clinical Social Worker',
    specializations: ['relationships', 'family', 'life transitions'],
    languages: ['Turkish', 'English', 'Arabic'],
    bio: 'Helping students navigate identity, family expectations, and major life decisions. Solution-focused and culturally sensitive.',
    email: 'mehmet.kaya@example.com',
    phone: '+90 216 555 0102',
    location: 'Istanbul, Turkey',
    avatar_color: '#88C0F7',
  },
  {
    name: 'Dr. Zeynep Yıldız',
    title: 'Counseling Psychologist',
    specializations: ['exam anxiety', 'sleep issues', 'burnout'],
    languages: ['Turkish', 'English'],
    bio: 'Particular interest in academic performance anxiety and study-related burnout. Mindfulness and ACT informed.',
    email: 'zeynepyildiz@example.com',
    phone: '+90 312 555 0103',
    location: 'Ankara, Turkey',
    avatar_color: '#F5A623',
  },
  {
    name: 'Can Aydın, MA',
    title: 'Mental Health Counselor',
    specializations: ['LGBTQ+ support', 'self-esteem', 'identity'],
    languages: ['Turkish', 'English'],
    bio: 'Affirming, non-judgmental space for students exploring identity, sexuality, and self-acceptance. Strengths-based practice.',
    email: 'canaydin@example.com',
    phone: '+90 232 555 0104',
    location: 'Izmir, Turkey',
    avatar_color: '#a855f7',
  },
  {
    name: 'Dr. Selin Çelik',
    title: 'Clinical Psychologist',
    specializations: ['trauma', 'anxiety', 'PTSD'],
    languages: ['Turkish', 'English', 'French'],
    bio: 'Specialized in trauma-informed care with EMDR certification. Working with international and exchange students.',
    email: 'selincelik@example.com',
    phone: '+90 212 555 0105',
    location: 'Istanbul, Turkey',
    accepting_new: false,
    avatar_color: '#ef4444',
  },
  {
    name: 'Burak Şahin, MSc',
    title: 'Counselor & Coach',
    specializations: ['career anxiety', 'motivation', 'procrastination'],
    languages: ['Turkish', 'English'],
    bio: 'Practical, action-oriented sessions for students struggling with motivation, focus, and post-graduation uncertainty.',
    email: 'buraksahin@example.com',
    phone: '+90 224 555 0106',
    location: 'Bursa, Turkey',
    avatar_color: '#3AA76D',
  },
  {
    name: 'Dr. Fatma Öztürk',
    title: 'Psychiatrist',
    specializations: ['mood disorders', 'medication management', 'ADHD'],
    languages: ['Turkish', 'English'],
    bio: 'Combines medication support with brief therapy. Accepting referrals for medication evaluation and ongoing care.',
    email: 'fatmaozturk@example.com',
    phone: '+90 216 555 0107',
    location: 'Istanbul, Turkey',
    avatar_color: '#88C0F7',
  },
  {
    name: 'Deniz Arslan, LPC',
    title: 'Licensed Professional Counselor',
    specializations: ['social anxiety', 'panic attacks', 'phobias'],
    languages: ['Turkish', 'English'],
    bio: 'Exposure-based treatment specialist. Compassionate approach to anxiety disorders that often hold students back.',
    email: 'denizarslan@example.com',
    phone: '+90 312 555 0108',
    location: 'Ankara, Turkey',
    avatar_color: '#F5A623',
  },
]

const seed = async () => {
  try {
    // skip if counselors already exist
    const existing = await pool.query('SELECT COUNT(*) FROM counselors')
    if (Number(existing.rows[0].count) > 0) {
      console.log('Counselors already seeded - skipping')
      process.exit(0)
    }

    for (const c of COUNSELORS) {
      await pool.query(
        `INSERT INTO counselors 
         (name, title, specializations, languages, bio, email, phone, location, accepting_new, avatar_color)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          c.name, c.title, c.specializations, c.languages,
          c.bio, c.email, c.phone, c.location,
          c.accepting_new !== undefined ? c.accepting_new : true,
          c.avatar_color,
        ]
      )
    }

    console.log(`✅ Seeded ${COUNSELORS.length} counselors`)
    process.exit(0)
  } catch (err) {
    console.error('❌ Seed failed:', err.message)
    process.exit(1)
  }
}

seed()