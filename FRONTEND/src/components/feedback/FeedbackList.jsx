// frontend/src/components/feedback/FeedbackList.jsx
import React, { useState } from 'react'
import FeedbackItem from './FeedbackItem'

const FeedbackList = ({ feedbacks, isHost }) => {
  const [visibleCount, setVisibleCount] = useState(10)

  if (feedbacks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No feedback yet. Be the first to share your thoughts!</p>
      </div>
    )
  }

  // Separate pinned and regular feedback
  const pinnedFeedback = feedbacks.filter(f => f.isPinned)
  const regularFeedback = feedbacks.filter(f => !f.isPinned)

  return (
    <div className="space-y-4">
      {/* Pinned feedback at the top */}
      {pinnedFeedback.length > 0 && (
        <div className="border-l-4 border-yellow-400 pl-4">
          <div className="text-sm font-medium text-yellow-700 mb-2">Pinned Feedback</div>
          <div className="space-y-4">
            {pinnedFeedback.map(feedback => (
              <FeedbackItem key={feedback.id} feedback={feedback} isHost={isHost} />
            ))}
          </div>
        </div>
      )}
      
      {/* Regular feedback with pagination */}
      {regularFeedback.length > 0 && (
        <div className="space-y-4">
          {regularFeedback.slice(0, visibleCount).map(feedback => (
            <FeedbackItem key={feedback.id} feedback={feedback} isHost={isHost} />
          ))}
          {visibleCount < regularFeedback.length && (
            <div className="flex justify-center mt-2">
              <button
                className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm"
                onClick={() => setVisibleCount(c => c + 10)}
              >
                View 10 more
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default FeedbackList