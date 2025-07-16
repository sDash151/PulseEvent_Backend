import React, { useState } from 'react'
import FeedbackItem from './FeedbackItem'

const FeedbackList = ({ feedbacks, isHost }) => {
  const [visibleCount, setVisibleCount] = useState(10)

  if (feedbacks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No feedback yet. Be the first to share your thoughts!</p>
      </div>
    )
  }

  // Separate pinned and regular feedback
  const pinnedFeedback = feedbacks.filter(f => f.isPinned)
  const regularFeedback = feedbacks.filter(f => !f.isPinned)

  // Refresh feedbacks after pin/flag
  const handleAction = () => {
    window.location.reload() // simplest way, or you can refetch feedbacks via parent
  }

  return (
    <div className="space-y-6">
      {/* Pinned Feedback */}
      {pinnedFeedback.length > 0 && (
        <div className="border-l-4 border-amber-400/70 pl-4">
          <div className="text-sm font-semibold text-amber-300 mb-2 tracking-wide uppercase">
            📌 Pinned Feedback
          </div>
          <div className="space-y-4">
            {pinnedFeedback.map(feedback => (
              <FeedbackItem key={feedback.id} feedback={feedback} isHost={isHost} onAction={handleAction} />
            ))}
          </div>
        </div>
      )}

      {/* Regular Feedback */}
      {regularFeedback.length > 0 && (
        <div className="space-y-4">
          {regularFeedback.slice(0, visibleCount).map(feedback => (
            <FeedbackItem key={feedback.id} feedback={feedback} isHost={isHost} onAction={handleAction} />
          ))}

          {(visibleCount < regularFeedback.length || visibleCount > 10) && (
            <div className="flex justify-center mt-4 gap-3">
              {visibleCount < regularFeedback.length && (
                <button
                  onClick={() => setVisibleCount(c => c + 10)}
                  className="px-5 py-2 rounded-full bg-white/10 text-amber-200 border border-white/10 hover:bg-amber-400/10 transition-colors duration-300 text-sm backdrop-blur-md"
                >
                  View 10 more
                </button>
              )}
              {visibleCount > 10 && (
                <button
                  onClick={() => setVisibleCount(c => Math.max(10, c - 10))}
                  className="px-5 py-2 rounded-full bg-white/10 text-gray-300 border border-white/10 hover:bg-white/20 transition-colors duration-300 text-sm backdrop-blur-md"
                >
                  View less
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default FeedbackList
