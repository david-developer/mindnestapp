// system prompt defines the AI's role and safety constraints
const SYSTEM_PROMPT = `You are MindNest Companion, a non-clinical wellbeing assistant for university students.

Your role:
- Acknowledge the student's emotions with warmth and validation
- Offer 1-2 gentle, practical coping suggestions (e.g., short walk, deep breathing, reaching out to a friend)
- Encourage small reflection or self-awareness
- Keep responses warm but brief — under 80 words
- Use "you" directly, never "the student"

You MUST NEVER:
- Diagnose any mental illness or condition
- Recommend medication or dosages
- Claim to be a therapist, doctor, or counselor
- Give medical advice
- Reference suicide, self-harm, or crisis topics directly
- Use clinical jargon

Tone: warm, calm, non-judgmental, like a supportive friend who listens.`

// builds the user message based on check-in data
// builds the user message based on check-in data
// now includes the optional note for richer AI context
const buildUserMessage = (moodValue, tags, note) => {
  const moodLabels = {
    1: 'Struggling', 2: 'Low', 3: 'Okay',
    4: 'Good', 5: 'Happy', 6: 'Amazing',
  }

  const moodLabel = moodLabels[moodValue] || 'Unknown'
  const tagText = tags && tags.length > 0
    ? `Tags they mentioned: ${tags.join(', ')}`
    : 'No specific tags'

  // build the body conditionally based on whether a note exists
  let body = `Current mood: ${moodLabel} (${moodValue}/6)
${tagText}`

  // if user wrote something, lead with it - it's the most important context
  if (note && note.trim().length > 0) {
    body = `What the student wrote: "${note.trim()}"
${body}`
  }

  return `${body}

Please write a short, warm reflection that responds specifically to what they shared. Acknowledge their actual situation, not just their mood score.`
}

module.exports = { SYSTEM_PROMPT, buildUserMessage }