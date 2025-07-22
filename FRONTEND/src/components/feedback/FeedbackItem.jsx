import React from 'react'
import { format } from 'date-fns'
import Button from '../ui/Button'
import { useRoleCheck } from '../../hooks/useRoleCheck'
import api from '../../services/api'
import { logSecurityEvent } from '../../utils/securityUtils'

const FeedbackItem = ({ feedback, isHost, onAction }) => {
  const { isEventHost, checkEventHost } = useRoleCheck();

  const handlePin = async () => {
    if (!isEventHost) {
      console.warn('Access denied: User is not the event host');
      logSecurityEvent('FEEDBACK_ACTION_DENIED', {
        action: 'pin_feedback',
        feedbackId: feedback.id,
        reason: 'not_event_host'
      });
      return;
    }
    
    try {
      await api.put(`/feedback/${feedback.id}/pin`, {
        isPinned: !feedback.isPinned
      });
      
      logSecurityEvent('FEEDBACK_ACTION_SUCCESS', {
        action: 'pin_feedback',
        feedbackId: feedback.id,
        isPinned: !feedback.isPinned
      });
      
      onAction();
    } catch (error) {
      console.error('Error pinning feedback:', error);
      logSecurityEvent('FEEDBACK_ACTION_FAILED', {
        action: 'pin_feedback',
        feedbackId: feedback.id,
        error: error.message
      });
    }
  }

  const handleFlag = async () => {
    if (!isEventHost) {
      console.warn('Access denied: User is not the event host');
      logSecurityEvent('FEEDBACK_ACTION_DENIED', {
        action: 'flag_feedback',
        feedbackId: feedback.id,
        reason: 'not_event_host'
      });
      return;
    }
    
    try {
      await api.put(`/feedback/${feedback.id}/flag`, {
        isFlagged: !feedback.isFlagged
      });
      
      logSecurityEvent('FEEDBACK_ACTION_SUCCESS', {
        action: 'flag_feedback',
        feedbackId: feedback.id,
        isFlagged: !feedback.isFlagged
      });
      
      onAction();
    } catch (error) {
      console.error('Error flagging feedback:', error);
      logSecurityEvent('FEEDBACK_ACTION_FAILED', {
        action: 'flag_feedback',
        feedbackId: feedback.id,
        error: error.message
      });
    }
  }

  return (
    <div className={`p-4 rounded-lg border ${
      feedback.isPinned ? 'bg-amber-500/10 border-amber-500/30' :
      feedback.isFlagged ? 'bg-red-500/10 border-red-500/30' :
      'bg-white/5 border-white/10'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{feedback.emoji}</span>
            <span className="text-white font-medium">{feedback.user?.name || 'Anonymous'}</span>
            {feedback.isPinned && (
              <span className="px-2 py-1 text-xs bg-amber-500/20 text-amber-300 rounded-full">
                📌 Pinned
              </span>
            )}
            {feedback.isFlagged && (
              <span className="px-2 py-1 text-xs bg-red-500/20 text-red-300 rounded-full">
                ⚠️ Flagged
              </span>
            )}
          </div>
          <p className="text-gray-300 mb-3">{feedback.content}</p>
        </div>

        {/* Time */}
        <div className="text-xs text-gray-400 whitespace-nowrap mt-1">
          {format(new Date(feedback.createdAt), 'h:mm a')}
        </div>
      </div>

      {/* Host Controls - Only show if user is the event host */}
      {isHost && isEventHost && (
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
