import React from 'react'
import Button from '../ui/Button'
import { format } from 'date-fns'
import { pinFeedback, flagFeedback } from '../../services/feedback'

const FeedbackItem = ({ feedback, isHost, onAction }) => {
  // Pin/Unpin handler
  const handlePin = async () => {
    await pinFeedback(feedback.id)
    if (onAction) onAction()
  }
  // Flag/Unflag handler
  const handleFlag = async () => {
    await flagFeedback(feedback.id)
    if (onAction) onAction()
  }
  const getStateStyles = () => {
    if (feedback.isPinned) {
      return 'border-amber-400 bg-amber-400/10'
    } else if (feedback.isFlagged) {
      return 'border-red-500 bg-red-500/10'
    } else {
      return 'border-white/10 bg-white/5'
    }
  }

  return (
    <div className={`p-4 md:p-5 rounded-xl border shadow-md backdrop-blur-md transition-all ${getStateStyles()}`}>
      <div className="flex justify-between items-start">
        {/* Left Side: Emoji + Content */}
        <div className="flex items-start gap-3">
          <div className="text-3xl">{feedback.emoji}</div>
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <span>{feedback.user.name}</span>
              {feedback.isPinned && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-amber-400/20 text-amber-300 border border-amber-300">
                  📌 Pinned
                </span>
              )}
              {feedback.isFlagged && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-red-500/20 text-red-300 border border-red-400">
                  🚩 Flagged
                </span>
              )}
            </div>
            <p className="mt-1 text-gray-300 text-sm whitespace-pre-line">
              {feedback.content}
            </p>
          </div>
        </div>

        {/* Time */}
        <div className="text-xs text-gray-400 whitespace-nowrap mt-1">
          {format(new Date(feedback.createdAt), 'h:mm a')}
        </div>
      </div>

      {/* Host Controls */}
      {isHost && (
        <div className="flex gap-2 mt-4">
          <Button 
            size="sm" 
            variant={feedback.isPinned ? 'primary' : 'outline'}
            onClick={handlePin}
          >
            {feedback.isPinned ? 'Unpin' : 'Pin'}
          </Button>
          <Button 
            size="sm" 
            variant={feedback.isFlagged ? 'danger' : 'outline'}
            onClick={handleFlag}
          >
            {feedback.isFlagged ? 'Unflag' : 'Flag'}
          </Button>
        </div>
      )}
    </div>
  )
}

export default FeedbackItem
