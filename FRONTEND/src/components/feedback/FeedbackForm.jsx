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
    <form onSubmit={handleSubmit} className="space-y-6 text-white">
      {/* Feedback Input */}
      <div>
        <label htmlFor="feedback" className="block text-sm font-medium text-amber-300 mb-1">
          Your Feedback
        </label>
        <textarea
          id="feedback"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts (max 250 chars)..."
          maxLength={250}
          rows={3}
          className="w-full px-4 py-3 bg-white/5 text-white placeholder-gray-400 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all"
        />
        <div className="text-right text-xs text-gray-400 mt-1">
          {content.length}/250
        </div>
      </div>

      {/* Emoji Picker */}
      <div>
        <label className="block text-sm font-medium text-amber-300 mb-2">React with an emoji</label>
        <div className="flex flex-wrap gap-2">
          {emojis.map(emoji => (
            <button
              key={emoji}
              type="button"
              onClick={() => setSelectedEmoji(prev => prev === emoji ? '' : emoji)}
              className={`text-2xl p-1 rounded-full transition-all duration-200
                ${
                  selectedEmoji === emoji
                    ? 'bg-amber-500/20 ring-2 ring-amber-400'
                    : 'hover:bg-white/10'
                }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-between items-center mt-4">
        <div>
          {selectedEmoji && (
            <span className="text-2xl">{selectedEmoji}</span>
          )}
        </div>
        <Button 
    type="submit" 
    className="-mt-2 transition-transform hover:-translate-y-0.5"
  >
          Send Feedback
        </Button>
      </div>
    </form>
  )
}

export default FeedbackForm
