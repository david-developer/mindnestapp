/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react'
import API from '../api/axios'
import BottomNav from '../components/dashboard/BottomNav'

export default function Journal() {
  const [entries, setEntries] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  // controls whether the write form is visible
  const [showForm, setShowForm] = useState(false)

  // fetch entries when page loads
  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    setLoading(true)
    try {
      const res = await API.get('/journal/entries')
      setEntries(res.data)
    } catch (err) {
      setError('Could not load entries')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!content.trim()) return
    setSubmitting(true)

    try {
      const res = await API.post('/journal/entry', { title, content })
      // add new entry to top of list without refetching
      setEntries(prev => [res.data, ...prev])
      // reset form
      setTitle('')
      setContent('')
      setShowForm(false)
    } catch (err) {
      setError('Could not save entry')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await API.delete(`/journal/entry/${id}`)
      // remove deleted entry from state without refetching
      setEntries(prev => prev.filter(e => e.id !== id))
    } catch (err) {
      setError('Could not delete entry')
    }
  }

  // format timestamp to readable date
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#FBFBFD' }}>

      {/* header */}
      <div
        className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between border-b border-gray-100"
        style={{ backgroundColor: '#FBFBFD' }}
      >
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#253244' }}>
            Journal
          </h1>
          <p className="text-xs text-gray-400">Your private space</p>
        </div>

        {/* toggle write form */}
        <button
          onClick={() => setShowForm(prev => !prev)}
          className="px-4 py-2 rounded-xl text-white text-sm font-semibold"
          style={{ backgroundColor: '#3AA76D' }}
        >
          {showForm ? 'Cancel' : '+ New Entry'}
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">

        {/* write form - only shows when showForm is true */}
        {showForm && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="font-semibold text-gray-700 mb-3">New Entry</p>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (optional)"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-green-400"
            />

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={5}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-400"
            />

            {error && (
              <p className="text-red-500 text-xs mt-2">{error}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting || !content.trim()}
              className="mt-3 w-full py-2 rounded-xl text-white font-semibold disabled:opacity-50"
              style={{ backgroundColor: '#3AA76D' }}
            >
              {submitting ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        )}

        {/* loading state */}
        {loading && (
          <p className="text-center text-gray-400 text-sm py-8">
            Loading entries...
          </p>
        )}

        {/* empty state */}
        {!loading && entries.length === 0 && !showForm && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📖</p>
            <p className="font-semibold text-gray-600">No entries yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Tap "New Entry" to start writing
            </p>
          </div>
        )}

        {/* entries list */}
        {entries.map(entry => (
          <div
            key={entry.id}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-gray-800">
                  {entry.title || 'Untitled'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatDate(entry.created_at)}
                </p>
              </div>

              {/* delete button */}
              <button
                onClick={() => handleDelete(entry.id)}
                className="text-gray-300 hover:text-red-400 transition text-lg"
              >
                🗑️
              </button>
            </div>

            {/* truncate long entries with line clamp */}
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
              {entry.content}
            </p>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  )
}