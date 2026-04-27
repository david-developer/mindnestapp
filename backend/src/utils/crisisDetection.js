// list of keywords/phrases that indicate potential crisis
// kept broad but not so wide that normal distress triggers it
const CRISIS_KEYWORDS = [
    // direct self-harm
    'suicide', 'suicidal', 'kill myself', 'end my life', 'end it all',
    'want to die', 'wanna die', 'better off dead', 'no reason to live',
    
    // self-harm
    'self harm', 'self-harm', 'hurt myself', 'cutting myself', 'cut myself',
    
    // hopelessness extremes
    'cant go on', "can't go on", 'give up on life', 'no point living',
    
    // direct danger
    'overdose', 'jump off', 'hang myself',
  ]
  
  // returns true if text contains any crisis phrase
  const containsCrisisLanguage = (text) => {
    if (!text) return false
    const lowered = text.toLowerCase()
    return CRISIS_KEYWORDS.some((keyword) => lowered.includes(keyword))
  }
  
  module.exports = { containsCrisisLanguage, CRISIS_KEYWORDS }