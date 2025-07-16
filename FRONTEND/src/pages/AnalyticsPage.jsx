import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AttendanceChart from '../components/analytics/AttendanceChart';
import EmojiChart from '../components/analytics/EmojiChart';
import KeywordCloud from '../components/analytics/KeywordCloud';
import Card from '../components/ui/Card';
import StatCard from '../components/analytics/StatCard';
import { fetchAnalytics } from '../services/analytics';

const AnalyticsPage = () => {
  const { eventId } = useParams();
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
    sentiment: { negative: 0, neutral: 0, positive: 0 },
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadAnalytics = async () => {
      try {
        const data = await fetchAnalytics(eventId);
        if (isMounted) setAnalytics(data);
      } catch (error) {
        if (isMounted) console.error('Failed to load analytics:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadAnalytics();
    const interval = setInterval(loadAnalytics, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [eventId]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex justify-center items-center">
        <div className="text-center text-gray-400 text-lg">No analytics data available for this event.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pt-24 pb-10 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
      {/* Ambient light spots */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute w-96 h-96 bg-pink-500 opacity-10 blur-3xl top-10 left-10 rounded-full"></div>
        <div className="absolute w-96 h-96 bg-amber-400 opacity-10 blur-3xl bottom-10 right-10 rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-white mb-2">📊 Event Analytics</h1>
          <p className="text-gray-300 text-lg">Insights from your event performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Total RSVPs" value={analytics.totalRsvps} change={analytics.rsvpChange} icon="👥" />
          <StatCard title="Check-ins" value={analytics.totalCheckIns} change={analytics.checkinRate} icon="✅" />
          <StatCard title="Feedback Sent" value={analytics.feedbackCount} change={analytics.feedbackChange} icon="💬" />
          <StatCard title="Engagement" value={`${analytics.engagementRate}%`} change={analytics.engagementChange} icon="🔥" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <Card title="Feedback Activity" className="bg-white/5 backdrop-blur-md rounded-2xl shadow-xl p-6">
            <AttendanceChart data={analytics.feedbackPerHour} />
          </Card>
          <Card title="Emoji Reactions" className="bg-white/5 backdrop-blur-md rounded-2xl shadow-xl p-6">
            <EmojiChart emojis={analytics.topEmojis} />
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card title="Top Keywords" className="lg:col-span-2 bg-white/5 backdrop-blur-md rounded-2xl shadow-xl p-6">
            <KeywordCloud keywords={analytics.topKeywords} />
          </Card>

          <Card title="Feedback Breakdown" className="bg-white/5 backdrop-blur-md rounded-2xl shadow-xl p-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Feedback Type</h4>
                <div className="space-y-2">
                  {analytics.feedbackTypes && analytics.feedbackTypes.length > 0 ? (
                    analytics.feedbackTypes.map((type, index) => (
                      <div key={index} className="flex items-center justify-between text-sm text-gray-300">
                        <span>{type.type}</span>
                        <span className="font-medium">{type.count} ({type.percentage}%)</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">No feedback types available.</p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <h4 className="text-sm font-medium text-white mb-2">Sentiment</h4>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden flex">
                  <div className="h-full bg-red-500" style={{ width: `${analytics.sentiment.negative}%` }} />
                  <div className="h-full bg-yellow-400" style={{ width: `${analytics.sentiment.neutral}%` }} />
                  <div className="h-full bg-green-500" style={{ width: `${analytics.sentiment.positive}%` }} />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                  <span>Negative: {analytics.sentiment.negative}%</span>
                  <span>Neutral: {analytics.sentiment.neutral}%</span>
                  <span>Positive: {analytics.sentiment.positive}%</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
