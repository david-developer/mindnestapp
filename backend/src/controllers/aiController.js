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

module.exports = { generateReflection }