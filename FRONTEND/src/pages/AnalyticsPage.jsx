// frontend/src/pages/AnalyticsPage.jsx
import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import AttendanceChart from '../components/analytics/AttendanceChart'
import EmojiChart from '../components/analytics/EmojiChart'
import KeywordCloud from '../components/analytics/KeywordCloud'
import Card from '../components/ui/Card'
import StatCard from '../components/analytics/StatCard'
import { fetchAnalytics } from '../services/analytics'

const AnalyticsPage = () => {
  const { eventId } = useParams()
  const [analytics, setAnalytics] = useState({
  totalRsvps: 0,
  rsvpChange: 0,
  totalCheckIns: 0,
  checkinRate: 0,
  feedbackCount: 0,
  feedbackChange: 0,
  engagementRate: 0,
  engagementChange: 0,
  feedbackPerHour: [],
  topEmojis: [],
  topKeywords: [],
  feedbackTypes: [],
  sentiment: {
    negative: 0,
    neutral: 0,
    positive: 0
  }
});

  const [loading, setLoading] = useState(true)

  // Live polling for analytics
  useEffect(() => {
    let isMounted = true;
    const loadAnalytics = async () => {
      try {
        const data = await fetchAnalytics(eventId)
        if (isMounted) setAnalytics(data)
      } catch (error) {
        if (isMounted) console.error('Failed to load analytics:', error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadAnalytics()
    const interval = setInterval(loadAnalytics, 5000) // Poll every 5 seconds
    return () => {
      isMounted = false;
      clearInterval(interval)
    }
  }, [eventId])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center py-12">
          <p className="text-gray-500">No analytics data available for this event.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Event Analytics</h1>
        <p className="text-gray-600 mt-1">Insights from your event performance</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total RSVPs" 
          value={analytics.totalRsvps} 
          change={analytics.rsvpChange} 
          icon="👥"
        />
        <StatCard 
          title="Check-ins" 
          value={analytics.totalCheckIns} 
          change={analytics.checkinRate} 
          icon="✅"
        />
        <StatCard 
          title="Feedback Sent" 
          value={analytics.feedbackCount} 
          change={analytics.feedbackChange} 
          icon="💬"
        />
        <StatCard 
          title="Engagement" 
          value={`${analytics.engagementRate}%`} 
          change={analytics.engagementChange} 
          icon="🔥"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card title="Feedback Activity">
          <AttendanceChart data={analytics.feedbackPerHour} />
        </Card>
        
        <Card title="Emoji Reactions">
          <EmojiChart emojis={analytics.topEmojis} />
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card title="Top Keywords" className="lg:col-span-2">
          <KeywordCloud keywords={analytics.topKeywords} />
        </Card>
        
        <Card title="Feedback Breakdown">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Feedback Type</h4>
              <div className="space-y-2">
                {analytics.feedbackTypes && analytics.feedbackTypes.length > 0 ? (
  analytics.feedbackTypes.map((type, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{type.type}</span>
                    <span className="text-sm font-medium">{type.count} ({type.percentage}%)</span>
                  </div>
                ))
) : (
  <p>No feedback types available.</p>
)}
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Sentiment</h4>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex">
  <div 
    className="h-full bg-red-500" 
    style={{ width: `${analytics.sentiment.negative}%` }}
  />
  <div 
    className="h-full bg-yellow-400" 
    style={{ width: `${analytics.sentiment.neutral}%` }}
  />
  <div 
    className="h-full bg-green-500" 
    style={{ width: `${analytics.sentiment.positive}%` }}
  />
</div>
              <div className="flex justify-between mt-2 text-xs text-gray-600">
                <span>Negative: {analytics.sentiment.negative}%</span>
                <span>Neutral: {analytics.sentiment.neutral}%</span>
                <span>Positive: {analytics.sentiment.positive}%</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default AnalyticsPage