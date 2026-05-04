const OpenAI = require('openai')
const { containsCrisisLanguage } = require('../utils/crisisDetection')
const { SYSTEM_PROMPT, CLASSIFIER_PROMPT, buildUserMessage } = require('../utils/aiPrompts')

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:5173',
    'X-Title': 'MindNest',
  },
})

// runs a focused classification call - ONLY checks for crisis content
// returns true if the AI judges the content as crisis-level
const classifyCrisis = async (textToClassify) => {
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || 'openai/gpt-oss-120b:free',
      messages: [
        { role: 'system', content: CLASSIFIER_PROMPT },
        { role: 'user', content: textToClassify },
      ],
      // very short response - just JSON
      max_tokens: 30,
      // low temperature for consistent classification
      temperature: 0.1,
    })

    const response = completion.choices[0].message.content.trim()

    // parse the JSON response - handle cases where model wraps in markdown
    const jsonMatch = response.match(/\{[^}]*\}/)
    if (!jsonMatch) {
      console.warn('Classifier returned non-JSON:', response)
      return false  // default to safe if we can't parse
    }

    const parsed = JSON.parse(jsonMatch[0])
    return parsed.crisis === true
  } catch (err) {
    console.error('Crisis classification error:', err.message)
    // fail safe - don't block reflection on classifier errors
    return false
  }
}

const generateReflection = async (req, res) => {
  const { mood_value, tags, note } = req.body

  try {
    // build the text we want to evaluate for crisis content
    const userText = `${note || ''} ${(tags || []).join(' ')}`.trim()

    // LAYER 1: keyword pre-filter (fast, no AI call)
    if (containsCrisisLanguage(userText)) {
      console.log('Crisis detected by keyword filter')
      return res.json({ isCrisis: true, reflection: null })
    }

    // LAYER 2: semantic classification (AI judges context)
    // only run if there's actual user content to evaluate
    if (userText.length > 5) {
      const isSemanticCrisis = await classifyCrisis(userText)
      if (isSemanticCrisis) {
        console.log('Crisis detected by semantic classifier')
        return res.json({ isCrisis: true, reflection: null })
      }
    }

    // safe input - generate the actual reflection
    const userMessage = buildUserMessage(mood_value, tags, note)

    const completion = await openai.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || 'openai/gpt-oss-120b:free',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 200,
      temperature: 0.7,
    })

    const reflection = completion.choices[0].message.content.trim()

    // LAYER 3: scan the AI's own output for any crisis language that slipped through
    if (containsCrisisLanguage(reflection)) {
      console.log('Crisis detected in AI output')
      return res.json({ isCrisis: true, reflection: null })
    }

    res.json({ isCrisis: false, reflection })
  } catch (err) {
    console.error('AI error:', err.message)
    res.status(500).json({ error: 'Could not generate reflection' })
  }
}

// generate a reflection on a specific journal entry
// reads the full entry text to provide deeper, contextual response
const reflectOnJournal = async (req, res) => {
  const { entry_text, mood_value } = req.body

  if (!entry_text || entry_text.trim().length < 10) {
    return res.status(400).json({ 
      error: 'Entry text too short for reflection' 
    })
  }

  try {
    // LAYER 1 + 2: same crisis safety as regular reflection
    if (containsCrisisLanguage(entry_text)) {
      console.log('Journal crisis detected by keyword filter')
      return res.json({ isCrisis: true, reflection: null })
    }

    const isSemanticCrisis = await classifyCrisis(entry_text)
    if (isSemanticCrisis) {
      console.log('Journal crisis detected by semantic classifier')
      return res.json({ isCrisis: true, reflection: null })
    }

    // build a journal-specific prompt
    const moodLabels = {
      1: 'Struggling', 2: 'Low', 3: 'Okay',
      4: 'Good', 5: 'Happy', 6: 'Amazing',
    }
    const moodContext = mood_value 
      ? `They tagged this entry with mood: ${moodLabels[mood_value]} (${mood_value}/6).` 
      : ''

    const userMessage = `A student wrote this journal entry:

"${entry_text.trim()}"

${moodContext}

Read what they wrote carefully. Then write a brief, warm reflection that:
- Acknowledges specific things they shared (not generic empathy)
- Highlights one strength or insight you notice in their writing
- Offers ONE gentle observation or question for further reflection
- Stays under 100 words

Respond as if you've truly read what they wrote.`

    const completion = await openai.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || 'openai/gpt-oss-120b:free',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 250,
      temperature: 0.7,
    })

    const reflection = completion.choices[0].message.content.trim()

    // LAYER 3: output safety scan
    if (containsCrisisLanguage(reflection)) {
      return res.json({ isCrisis: true, reflection: null })
    }

    res.json({ isCrisis: false, reflection })
  } catch (err) {
    console.error('Journal AI error:', err.message)
    res.status(500).json({ error: 'Could not generate reflection' })
  }
}

module.exports = { generateReflection, reflectOnJournal }
