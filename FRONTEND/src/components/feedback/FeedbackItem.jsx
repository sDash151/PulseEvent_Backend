// frontend/src/components/feedback/FeedbackItem.jsx
import React from 'react'
import Button from '../ui/Button'
import { format } from 'date-fns'

const FeedbackItem = ({ feedback, isHost }) => {
  return (
    <div className={`p-4 rounded-lg border ${
      feedback.isPinned 
        ? 'border-yellow-400 bg-yellow-50' 
        : feedback.isFlagged
          ? 'border-red-200 bg-red-50'
          : 'border-gray-200'
    }`}>
      <div className="flex justify-between">
        <div className="flex items-start">
          <div className="text-3xl mr-3">{feedback.emoji}</div>
          <div>
            <div className="flex items-center">
              <span className="font-medium text-gray-900">{feedback.user.name}</span>
              {feedback.isPinned && (
                <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                  Pinned
                </span>
              )}
              {feedback.isFlagged && (
                <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                  Flagged
                </span>
              )}
            </div>
            <p className="text-gray-700 mt-1">{feedback.content}</p>
          </div>
        </div>
        <div className="text-sm text-gray-500 whitespace-nowrap">
          {format(new Date(feedback.createdAt), 'h:mm a')}
        </div>
      </div>
      
      {isHost && (
        <div className="flex gap-2 mt-3">
          <Button 
            size="sm" 
            variant={feedback.isPinned ? 'primary' : 'outline'}
            onClick={() => {}} // TODO: Implement pin
          >
            {feedback.isPinned ? 'Unpin' : 'Pin'}
          </Button>
          <Button 
            size="sm" 
            variant={feedback.isFlagged ? 'danger' : 'outline'}
            onClick={() => {}} // TODO: Implement flag
          >
            {feedback.isFlagged ? 'Unflag' : 'Flag'}
          </Button>
        </div>
      )}
    </div>
  )
}

export default FeedbackItem