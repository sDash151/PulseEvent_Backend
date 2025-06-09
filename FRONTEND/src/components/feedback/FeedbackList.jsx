// frontend/src/components/feedback/FeedbackList.jsx
import FeedbackItem from './FeedbackItem'

const FeedbackList = ({ feedbacks, isHost }) => {
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
      
      {/* Regular feedback */}
      {regularFeedback.length > 0 && (
        <div className="space-y-4">
          {regularFeedback.map(feedback => (
            <FeedbackItem key={feedback.id} feedback={feedback} isHost={isHost} />
          ))}
        </div>
      )}
    </div>
  )
}

export default FeedbackList