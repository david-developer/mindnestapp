import { useState } from 'react'

// mood levels mapped to emoji and labels
const MOOD_LEVELS = [
    { value: 1, emoji: '😞', label: 'Struggling',  color: '#ef4444' },
    { value: 2, emoji: '😕', label: 'Low',        color: '#f97316' },
    { value: 3, emoji: '😐', label: 'Okay',       color: '#eab308' },
    { value: 4, emoji: '🙂', label: 'Good',       color: '#22c55e' },
    { value: 5, emoji: '😊', label: 'Happy',       color: '#22c55e' },
    { value: 6, emoji: '😄', label: 'Amazing',     color: '#3AA76D'  },
]

// available quick mood tags students can pick from
const TAGS = [
    'exam', 'sleep', 'stressed', 'tired', 'happy', 
    'anxious', 'motivated', 'lonely'
]

// eslint-disable-next-line no-unused-vars
export default function MoodCheckIn({ user }) {
    const [moodValue, setMoodValue] = useState(3) //slider value 1-6, starts at the middle
    const [selectedTags, setSelectedTags] = useState([])
    const [submitted, setSubmitted] = useState(false) //constrols whether the card has been submitted

    //get the mood object that matches current slider value
    const currentMood = MOOD_LEVELS.find(m => m.value === moodValue)

    const toggleTag = (tag) => {
        setSelectedTags(prev => {
            if(prev.includes(tag)) return prev.filter(t => t !== tag) // remove if already selected
            if (prev.length >=3) return prev //if at max 3, dont add more
            //otherwise add it
            return [...prev, tag]
        })
    }

    const handleSubmit = () => {
        console.log('submitting mood:', { moodValue, selectedTags })
        setSubmitted(true)
    }

    //show success state after submission
    if (submitted) {
        return (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
                <p className="text-4xl mb-2">✨</p>
                <p className="font-bold text-gray-800">Check-in saved!</p>
                <p className="text-sm text-gray-400 mt-1">
                    Your reflection is being prepared...
                </p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-lg font-bold" style={{ color: '#253244'}}>
                How are you right now?
            </p>
            <p className="text-sm text-gray-400 mt-1 mb-2">
                One quick check helps notice patterns.
            </p>

            {/* mood emoji + label. Updates as slider moves */}
            <div className="flex flex-col items-center mb-4">
                <span
                  className="font-bold text-lg transition-all duration-200"
                  style={{ color: currentMood.color}}
                  >
                    {currentMood.label}
                  </span>
                <span className="text-5xl mb-1">{currentMood.emoji}</span>
                
            </div>

            {/* mood slider */}
            <div className="mb-2">
                <input
                    type="range"
                    min="1"
                    max="6"
                    value={moodValue}
                    onChange={(e) => setMoodValue(Number(e.target.value))}
                    className="w-full accent-green-500 cursor-pointer"
                />
                {/* slider and labels*/}
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Not great</span>
                    <span>Amazing</span>
                </div>
            </div>

            {/* tag selection */}
            <div className="mt-4 mb-5">
                <p className="text-sm font-medium text-gray-600 mb-2">
                    What's happening?
                    <span className="text-gray-400"> (Pick up to 3) </span>
                </p>
                <div className="flex flex-wrap gap-2">
                    {TAGS.map(tag => {
                        const isSelected = selectedTags.includes(tag)
                        return (
                            <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className="px-3 py-1 rounded-full text-sm font-medium border transition-all duration-150"
                            style={{
                                backgroundColor: isSelected ? '#3AA76D' : 'transparent',
                                color: isSelected ? 'white' : '#6b7280',
                                borderColor: isSelected ? '#3AA76D' : '#d1d5db',
                             }}
                             >
                                {tag}
                             </button>
                        )
                    })}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
                {/* primary CTA */}
                <button
                onClick={handleSubmit}
                className="flex-1 py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #3AA76D, #22c55e'}}
                >
                    ✦ Reflect
                </button>

                {/* secondary journal shorcut */}
                <button
                    className="px-4 py-3 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50"
                    title="Add journal entry"
                >
                    📝
                </button>
            </div>
         </div>

    )
}




