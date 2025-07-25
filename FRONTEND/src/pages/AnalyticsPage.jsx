import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useRoleCheck } from '../hooks/useRoleCheck';
import AnalyticsPanel from '../components/analytics/AnalyticsPanel';
import AttendanceChart from '../components/analytics/AttendanceChart';
import EmojiChart from '../components/analytics/EmojiChart';
import HeatmapChart from '../components/analytics/HeatmapChart';
import KeywordCloud from '../components/analytics/KeywordCloud';
import RegisteredUsersTable from '../components/analytics/RegisteredUsersTable';
import StatCard from '../components/analytics/StatCard';
import UserStatistics from '../components/analytics/UserStatistics';
import BackButton from '../components/ui/BackButton';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import PageContainer from '../components/ui/PageContainer';
import Loading from '../components/ui/Loading';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { fetchEventById } from '../services/events';
import { fetchAnalytics } from '../services/analytics';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { ChartBarIcon, CalendarIcon, FunnelIcon, UserGroupIcon, ClockIcon, ArrowTrendingUpIcon, ShareIcon, ChatBubbleLeftEllipsisIcon, HeartIcon, HandThumbUpIcon, StarIcon, FireIcon, BoltIcon, EyeIcon, MapIcon } from '@heroicons/react/24/outline';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { extractParticipants } from '../utils/fieldExtractors';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ChartTitle, Tooltip, Legend, Filler);

// Simple SentimentDonutChart component
const SentimentDonutChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-400">
        No sentiment data available
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const colors = {
    positive: '#10B981', // green
    neutral: '#F59E0B',  // amber
    negative: '#EF4444'  // red
  };

  return (
    <div className="flex items-center justify-center h-32">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const strokeDasharray = `${percentage * 3.14159} 314.159`;
            const strokeDashoffset = index === 0 ? 0 : -data.slice(0, index).reduce((sum, prev) => sum + (prev.value / total) * 314.159, 0);
            
            return (
              <circle
                key={item.sentiment}
                cx="50"
                cy="50"
                r="50"
                fill="none"
                stroke={colors[item.sentiment] || '#6B7280'}
                strokeWidth="10"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="opacity-80"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold text-white">{total}</span>
        </div>
      </div>
      <div className="ml-4 space-y-1">
        {data.map((item) => (
          <div key={item.sentiment} className="flex items-center text-sm">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: colors[item.sentiment] }}
            />
            <span className="capitalize text-gray-300">{item.sentiment}: {item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AnalyticsPage = () => {
  const { eventId } = useParams();
  const { currentUser, loading: authLoading } = useAuth();
  const { isHost, canAccessHostFeatures, loading: roleLoading } = useRoleCheck();
  const [event, setEvent] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Advanced Analytics State
  const [viewMode, setViewMode] = useState('overview'); // overview, trends, funnel, comparison
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [filters, setFilters] = useState({
    attendanceStatus: 'all', // all, checked-in, not-checked-in
    registrationType: 'all', // all, registration, waiting-list
    demographic: 'all', // all, college, degree, gender
    sentiment: 'all' // all, positive, neutral, negative
  });
  const [showFilters, setShowFilters] = useState(false);
  const [exportModal, setExportModal] = useState(false);
  const [realTimeMode, setRealTimeMode] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState([
    'attendance', 'feedback', 'demographics', 'engagement'
  ]);
  const [alertsEnabled, setAlertsEnabled] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!eventId || !isHost) return;
      
      setLoading(true);
      try {
        const [eventData, analyticsData] = await Promise.all([
          fetchEventById(eventId),
          fetchAnalytics(eventId)
        ]);
        
        setEvent(eventData);
        setAnalytics(analyticsData);
      } catch (err) {
        setError(err.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [eventId, isHost]);

  if (authLoading || roleLoading) {
    return <Loading />;
  }

  // 🔐 Role-based access control - moved after loading states
  if (!canAccessHostFeatures()) {
    console.warn('Access denied: User is not a host', { 
      userId: currentUser?.id, 
      userRole: currentUser?.role 
    });
    return <Navigate to="/dashboard" replace />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{error}</p>
          <BackButton />
        </div>
      </div>
    );
  }

  if (loading) {
    return <Loading />;
  }

  // --- Export Clean Participants CSV ---
  const handleExportCleanParticipantsCSV = () => {
    if (!analytics || !analytics.registeredUsers) return;
    // 1. Gather all unique custom field labels from registration.responses
    const fixedHeader = [
      'Team Name',
      'Name',
      'College Name',
      'Degree Name',
      'USN',
      'Email',
      'Gender',
      'Payment Proof',
      'WhatsApp Number' // Use only the no-space version in the header
    ];
    const fixedHeaderLower = fixedHeader.map(h => h.trim().toLowerCase());
    const customFieldSet = new Set();
    analytics.registeredUsers.forEach(reg => {
      if (reg.responses && typeof reg.responses === 'object') {
        Object.keys(reg.responses).forEach(label => {
          // Merge both WhatsApp variants into one
          const normalized = label.trim().replace(/\s+/g, '').toLowerCase();
          if (normalized === 'whatsappnumber') return; // Already in fixed header
          if (!fixedHeaderLower.includes(label.trim().toLowerCase())) {
            customFieldSet.add(label);
          }
        });
      }
    });
    const customFields = Array.from(customFieldSet).filter(label => {
      // Remove Whats App Number variant from custom fields
      const normalized = label.trim().replace(/\s+/g, '').toLowerCase();
      return normalized !== 'whatsappnumber';
    });
    // 2. Build header
    const header = [...fixedHeader, ...customFields];
    // 3. Build rows
    let rows = [];
    analytics.registeredUsers.forEach(reg => {
      const participants = extractParticipants(reg);
      // Merge WhatsApp Number values from both variants
      const whatsappValue = reg.responses?.['WhatsApp Number'] || reg.responses?.['Whats App Number'] || '-';
      if (participants.length > 0) {
        participants.forEach(participant => {
          const row = {
            'Team Name': participant.teamName || '-',
            'Name': participant.name || '-',
            'College Name': participant.college || '-',
            'Degree Name': participant.degree || '-',
            'USN': participant.usn || '-',
            'Email': participant.email || '-',
            'Gender': participant.gender || '-',
            'Payment Proof': reg.paymentProof || '-',
            'WhatsApp Number': participant.whatsapp || whatsappValue,
          };
          // Add all custom fields for this registration
          customFields.forEach(label => {
            row[label] = reg.responses && reg.responses[label] !== undefined ? reg.responses[label] : '-';
          });
          rows.push(row);
        });
      } else {
        // Solo registration: use registration.responses as participant row
        const row = {
          'Team Name': reg.teamName || '-',
          'Name': reg.name || '-',
          'College Name': reg.responses?.['College Name'] || '-',
          'Degree Name': reg.responses?.['Degree Name'] || '-',
          'USN': reg.responses?.['USN'] || '-',
          'Email': reg.email || '-',
          'Gender': reg.responses?.['Gender'] || '-',
          'Payment Proof': reg.paymentProof || '-',
          'WhatsApp Number': whatsappValue,
        };
        customFields.forEach(label => {
          row[label] = reg.responses && reg.responses[label] !== undefined ? reg.responses[label] : '-';
        });
        rows.push(row);
      }
    });
    // Remove duplicate rows
    const uniqueRows = rows.filter((row, idx, arr) =>
      idx === arr.findIndex(r => JSON.stringify(r) === JSON.stringify(row))
    );
    // Use PapaParse to generate CSV
    const csv = Papa.unparse({ fields: header, data: uniqueRows.map(row => header.map(h => row[h] ?? '-')) });
    // Download
    const filename = `participants_clean_${event?.title?.replace(/\s+/g, '_') || 'event'}_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;
    saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), filename);
  };

  // --- Export Clean Rejected Candidates CSV ---
  const handleExportRejectedCandidatesCSV = () => {
    if (!analytics || !analytics.rejectedCandidates) return;
    // Use the same headers and logic as registered users
    const fixedHeader = [
      'Team Name',
      'Name',
      'College Name',
      'Degree Name',
      'USN',
      'Email',
      'Gender',
      'Payment Proof',
      'WhatsApp Number'
    ];
    const fixedHeaderLower = fixedHeader.map(h => h.trim().toLowerCase());
    const customFieldSet = new Set();
    analytics.rejectedCandidates.forEach(reg => {
      if (reg.responses && typeof reg.responses === 'object') {
        Object.keys(reg.responses).forEach(label => {
          const normalized = label.trim().replace(/\s+/g, '').toLowerCase();
          if (normalized === 'whatsappnumber') return;
          if (!fixedHeaderLower.includes(label.trim().toLowerCase())) {
            customFieldSet.add(label);
          }
        });
      }
    });
    const customFields = Array.from(customFieldSet).filter(label => {
      const normalized = label.trim().replace(/\s+/g, '').toLowerCase();
      return normalized !== 'whatsappnumber';
    });
    const header = [...fixedHeader, ...customFields];
    let rows = [];
    analytics.rejectedCandidates.forEach(reg => {
      const participants = extractParticipants(reg);
      const whatsappValue = reg.responses?.['WhatsApp Number'] || reg.responses?.['Whats App Number'] || '-';
      if (participants.length > 0) {
        participants.forEach(participant => {
          const row = {
            'Team Name': participant.teamName || '-',
            'Name': participant.name || '-',
            'College Name': participant.college || '-',
            'Degree Name': participant.degree || '-',
            'USN': participant.usn || '-',
            'Email': participant.email || '-',
            'Gender': participant.gender || '-',
            'Payment Proof': reg.paymentProof || '-',
            'WhatsApp Number': participant.whatsapp || whatsappValue,
          };
          customFields.forEach(label => {
            row[label] = reg.responses && reg.responses[label] !== undefined ? reg.responses[label] : '-';
          });
          rows.push(row);
        });
      } else {
        const row = {
          'Team Name': reg.teamName || '-',
          'Name': reg.name || '-',
          'College Name': reg.responses?.['College Name'] || '-',
          'Degree Name': reg.responses?.['Degree Name'] || '-',
          'USN': reg.responses?.['USN'] || '-',
          'Email': reg.email || '-',
          'Gender': reg.responses?.['Gender'] || '-',
          'Payment Proof': reg.paymentProof || '-',
          'WhatsApp Number': whatsappValue,
        };
        customFields.forEach(label => {
          row[label] = reg.responses && reg.responses[label] !== undefined ? reg.responses[label] : '-';
        });
        rows.push(row);
      }
    });
    const uniqueRows = rows.filter((row, idx, arr) =>
      idx === arr.findIndex(r => JSON.stringify(r) === JSON.stringify(row))
    );
    const csv = Papa.unparse({ fields: header, data: uniqueRows.map(row => header.map(h => row[h] ?? '-')) });
    const filename = `rejected_candidates_${event?.title?.replace(/\s+/g, '_') || 'event'}_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;
    saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), filename);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-amber-300 mb-2">
              Event Analytics
            </h1>
            <p className="text-gray-300">
              {event?.title} - Host Dashboard
            </p>
          </div>
          <BackButton />
        </div>

        {/* 🔐 Host-only warning banner */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center mr-3">
              <span className="text-amber-300 text-sm">🔐</span>
            </div>
            <div>
              <h3 className="text-amber-300 font-semibold">Host-Only Access</h3>
              <p className="text-gray-300 text-sm">
                This analytics dashboard is only accessible to event hosts.
              </p>
            </div>
          </div>
        </div>

        {analytics && (
          <>
            {/* Primary Stats Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Attendees"
                value={
                  analytics.registeredUsers
                    ? analytics.registeredUsers.length
                    : analytics.totalAttendees || analytics.totalRsvps || 0
                }
                icon={<UserGroupIcon className="w-8 h-8" />}
                color="blue"
                trend="+12%"
                subtitle="vs last event"
              />
              <StatCard
                title="Checked In"
                value={
                  analytics.registeredUsers
                    ? analytics.registeredUsers.filter(u => u.checkedIn).length
                    : analytics.checkedIn || analytics.totalCheckIns || 0
                }
                icon={<HandThumbUpIcon className="w-8 h-8" />}
                color="green"
                trend="+8%"
                subtitle="attendance rate"
              />
              <StatCard
                title="Feedback Count"
                value={analytics.feedbackCount}
                icon={<ChatBubbleLeftEllipsisIcon className="w-8 h-8" />}
                color="purple"
                trend="+25%"
                subtitle="engagement up"
              />
              <StatCard
                title="Registration Rate"
                value={`${analytics.registrationRate || 0}%`}
                icon={<ArrowTrendingUpIcon className="w-8 h-8" />}
                color="amber"
                trend="+5%"
                subtitle="conversion rate"
              />
            </div>

            {/* Advanced Analytics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Avg. Session Time"
                value={analytics?.avgSessionTime || 'N/A'}
                icon={<ClockIcon className="w-8 h-8" />}
                color="indigo"
                trend={analytics?.avgSessionTimeTrend || ''}
                subtitle="vs target"
              />
              <StatCard
                title="Satisfaction Score"
                value={analytics?.satisfactionScore || 'N/A'}
                icon={<StarIcon className="w-8 h-8" />}
                color="yellow"
                trend={analytics?.satisfactionScoreTrend || ''}
                subtitle="rating improved"
              />
              <StatCard
                title="Team Formations"
                value={analytics?.totalTeams ?? 'N/A'}
                icon={<UserGroupIcon className="w-8 h-8" />}
                color="teal"
                trend={analytics?.totalTeamsTrend || ''}
                subtitle="collaboration up"
              />
              <StatCard
                title="Engagement Rate"
                value={analytics?.engagementRate ? `${analytics.engagementRate}%` : 'N/A'}
                icon={<HeartIcon className="w-8 h-8" />}
                color="pink"
                trend={analytics?.engagementRateTrend || ''}
                subtitle="active participation"
              />
            </div>
          </>
        )}

        {/* Sub-Event Registration Chart (Mega Events Only) */}
        {analytics?.subEventRegistrations && analytics?.subEventRegistrations.length > 0 && event?.type === 'MEGA' && (
          <Card>
            <h2 className="text-xl font-semibold mb-4">Sub-Event Registrations</h2>
            <p className="text-gray-400 mb-6 text-sm">See how close each sub event is to capacity.</p>
            <div className="w-full h-96 overflow-hidden">
              <Bar
                data={{
                  labels: analytics.subEventRegistrations.map(s => s.subEventTitle),
                  datasets: [
                    {
                      label: 'Max Attendees',
                      data: analytics.subEventRegistrations.map(s => s.maxAttendees),
                      backgroundColor: 'rgba(156, 163, 175, 0.18)', // gray-400/18
                      borderRadius: 8,
                      barPercentage: 0.7,
                      categoryPercentage: 0.8,
                      order: 1,
                    },
                    {
                      label: 'Registrations',
                      data: analytics.subEventRegistrations.map(s => s.registrationCount),
                      backgroundColor: 'rgba(59, 130, 246, 0.92)', // blue-500
                      borderRadius: 8,
                      barPercentage: 0.5,
                      categoryPercentage: 0.8,
                      order: 2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'top', labels: { color: '#fff', font: { size: 14 } } },
                    title: { display: false },
                    tooltip: { mode: 'index', intersect: false },
                  },
                  scales: {
                    x: {
                      stacked: false,
                      grid: { color: 'rgba(255,255,255,0.08)' },
                      ticks: { color: '#fff', font: { size: 13 } },
                      beginAtZero: true,
                    },
                    y: {
                      stacked: false,
                      grid: { color: 'rgba(255,255,255,0.08)' },
                      ticks: { color: '#fff', font: { size: 13 } },
                    },
                  },
                  barThickness: 32,
                  categoryPercentage: 0.8,
                  barPercentage: 0.7,
                }}
              />
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <h2 className="text-xl font-semibold mb-4">Attendance Overview</h2>
            <AttendanceChart data={analytics?.attendanceData} />
          </Card>

          <Card>
            <h2 className="text-xl font-semibold mb-4">Feedback Sentiment</h2>
            <div className="space-y-4">
              <EmojiChart emojis={analytics?.topEmojis || []} />
              <div className="border-t border-gray-600 pt-4">
                <h3 className="text-sm font-medium text-gray-300 mb-3">Sentiment Distribution</h3>
                <SentimentDonutChart data={
                  analytics?.sentiment && (
                    [
                      { sentiment: 'positive', value: analytics?.sentiment?.positive },
                      { sentiment: 'neutral', value: analytics?.sentiment?.neutral },
                      { sentiment: 'negative', value: analytics?.sentiment?.negative }
                    ].filter(item => typeof item.value === 'number')
                  )
                } />
              </div>
            </div>
          </Card>
        </div>

        {/* Feedback Activity Timeline */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Feedback Activity Timeline</h2>
          <div className="h-80 rounded-xl bg-white/5 backdrop-blur-lg p-4">
            <Line 
              data={{
                labels: (analytics?.feedbackPerHour || []).map(item =>
                  new Date(item.hour).toLocaleTimeString([], { hour: '2-digit' })
                ),
                datasets: [
                  {
                    label: 'Feedback Activity',
                    data: (analytics?.feedbackPerHour || []).map(item => item.count),
                    borderColor: '#facc15', // amber-400
                    backgroundColor: 'rgba(250, 204, 21, 0.15)',
                    borderWidth: 2,
                    pointBackgroundColor: '#facc15',
                    pointBorderColor: '#0f0c29',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    tension: 0.35,
                    fill: true
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    backgroundColor: '#1c1c2b',
                    titleColor: '#facc15',
                    bodyColor: '#e5e7eb',
                    borderColor: '#facc15',
                    borderWidth: 1,
                    padding: 10,
                    boxPadding: 6,
                    usePointStyle: true,
                    callbacks: {
                      title: (tooltipItems) => `Hour: ${tooltipItems[0].label}`
                    }
                  }
                },
                scales: {
                  x: {
                    grid: {
                      display: false
                    },
                    ticks: {
                      color: '#a1a1aa',
                      font: { size: 14, weight: 'bold' }
                    }
                  },
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(255,255,255,0.1)'
                    },
                    ticks: {
                      color: '#a1a1aa',
                      precision: 0,
                      font: { size: 14 }
                    }
                  }
                }
              }}
            />
          </div>
        </Card>

        {/* Activity Heatmap Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
          <Card>
            <HeatmapChart type="hourly" data={analytics?.hourlyEngagement} />
          </Card>

          <Card>
            <HeatmapChart type="monthly" data={analytics?.monthlyActivity} />
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <Card>
            <h2 className="text-xl font-semibold mb-4">Popular Keywords</h2>
            <KeywordCloud keywords={analytics?.topKeywords || []} />
          </Card>

          <Card>
            <h2 className="text-xl font-semibold mb-4">User Demographics</h2>
            <UserStatistics users={analytics?.registeredUsers || []} />
          </Card>
        </div>

        <Card className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Registered Users</h2>
            <Button
              onClick={handleExportCleanParticipantsCSV}
              variant="amber"
              title="Export Participants (Clean CSV)"
            >
              <span role="img" aria-label="csv">📄</span>
              Export Participants (Clean CSV)
            </Button>
          </div>
          <RegisteredUsersTable users={analytics?.registeredUsers} />
        </Card>
        {/* Rejected Candidates Section */}
        <Card className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-red-400">Rejected Candidates</h2>
            <Button
              onClick={handleExportRejectedCandidatesCSV}
              variant="red"
              title="Export Rejected Candidates (CSV)"
            >
              <span role="img" aria-label="csv">📄</span>
              Export Rejected Candidates (CSV)
            </Button>
          </div>
          <RegisteredUsersTable users={analytics?.rejectedCandidates || []} heading="Rejected Candidates" summaryLabel="rejections" />
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;


