// frontend/src/components/feedback/FeedbackForm.jsx
import React, { useState } from 'react'
import Button from '../ui/Button'

const emojis = ['😀', '😍', '👍','❤️', '🔥', '👏', '🎉','🤣','😡', '😞', '👎', '💔', '😢', '😭', '😠', '😤','💩']

const FeedbackForm = ({ onSubmit }) => {
  const [content, setContent] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!content.trim() && !selectedEmoji) return
    onSubmit(content, selectedEmoji)
    setContent('')
    setSelectedEmoji('')
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts (max 250 chars)..."
          maxLength={250}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          rows={3}
        />
        <div className="text-right text-xs text-gray-500 mt-1">
          {content.length}/250
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {emojis.map(emoji => (
          <button
            key={emoji}
            type="button"
            className={`text-2xl p-1 rounded-full hover:bg-gray-100 transition-colors ${
              selectedEmoji === emoji ? 'bg-indigo-100 ring-2 ring-indigo-500' : ''
            }`}
            onClick={() => setSelectedEmoji(prev => prev === emoji ? '' : emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
      
      <div className="flex justify-between items-center">
        <div>
          {selectedEmoji && (
            <span className="text-2xl">{selectedEmoji}</span>
          )}
        </div>
        <Button type="submit" variant="primary">
          Send Feedback
        </Button>
      </div>
    </form>
  )
}

export default FeedbackForm