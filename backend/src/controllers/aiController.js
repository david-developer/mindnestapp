const OpenAI = require('openai')
const { containsCrisisLanguage } = require('../utils/crisisDetection')
const { SYSTEM_PROMPT, buildUserMessage } = require('../utils/aiPrompts')

// initialize OpenRouter client 
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  // optional headers that OpenRouter recommends for analytics on their dashboard
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:5173',
    'X-Title': 'MindNest',
  },
})

const generateReflection = async (req, res) => {
  const { mood_value, tags, note } = req.body

  try {
    // LAYER 1: check user input for crisis keywords before calling AI
    const inputText = `${note || ''} ${(tags || []).join(' ')}`
    if (containsCrisisLanguage(inputText)) {
      return res.json({
        isCrisis: true,
        reflection: null,
      })
    }

    // build the messages array
    const userMessage = buildUserMessage(mood_value, tags, note)

    // call OpenRouter with the chosen free model
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

    // LAYER 2: scan AI output for any crisis language that slipped through
    if (containsCrisisLanguage(reflection)) {
      return res.json({
        isCrisis: true,
        reflection: null,
      })
    }

    res.json({
      isCrisis: false,
      reflection,
    })
  } catch (err) {
    console.error('AI error:', err.message)
    res.status(500).json({ error: 'Could not generate reflection' })
  }
}

module.exports = { generateReflection }