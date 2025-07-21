import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarIcon,
  UserGroupIcon,
  ChartBarIcon,
  ChatBubbleLeftEllipsisIcon,
  BellIcon,
  CogIcon,
  ShieldCheckIcon,
  CloudArrowUpIcon,
  QrCodeIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ClockIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  FireIcon,
  BoltIcon,
  StarIcon,
  HeartIcon,
  EyeIcon,
  HandThumbUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  QuestionMarkCircleIcon,
  ArrowTrendingUpIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  LockClosedIcon,
  ArrowDownTrayIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon,
  MapIcon,
  ClockIcon as ClockIconSolid,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  DocumentChartBarIcon,
  CpuChipIcon,
  SignalIcon,
  WifiIcon,
  DeviceTabletIcon,
  CommandLineIcon,
  ServerStackIcon,
  KeyIcon,
  FingerPrintIcon,
  EyeSlashIcon,
  ArchiveBoxIcon,
  DocumentDuplicateIcon,
  TableCellsIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ForwardIcon,
  BackwardIcon,
  PlusIcon,
  MinusIcon,
  XMarkIcon,
  ChevronDownIcon as ChevronDownIconSolid,
  ChevronUpIcon as ChevronUpIconSolid,
  ChevronLeftIcon as ChevronLeftIconSolid,
  ChevronRightIcon as ChevronRightIconSolid
} from '@heroicons/react/24/outline';
import {
  ChartBarIcon as ChartBarIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  CalendarIcon as CalendarIconSolid,
  BellIcon as BellIconSolid,
  CogIcon as CogIconSolid,
  ShieldCheckIcon as ShieldCheckIconSolid,
  CloudArrowUpIcon as CloudArrowUpIconSolid,
  QrCodeIcon as QrCodeIconSolid,
  CreditCardIcon as CreditCardIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  ClockIcon as ClockIconSolid2,
  MapPinIcon as MapPinIconSolid,
  EnvelopeIcon as EnvelopeIconSolid,
  PhoneIcon as PhoneIconSolid,
  GlobeAltIcon as GlobeAltIconSolid,
  FireIcon as FireIconSolid,
  BoltIcon as BoltIconSolid,
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid,
  EyeIcon as EyeIconSolid,
  HandThumbUpIcon as HandThumbUpIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  QuestionMarkCircleIcon as QuestionMarkCircleIconSolid,
  ArrowTrendingUpIcon as ArrowTrendingUpIconSolid,
  DevicePhoneMobileIcon as DevicePhoneMobileIconSolid,
  ComputerDesktopIcon as ComputerDesktopIconSolid,
  CircleStackIcon as CircleStackIconSolid,
  LockClosedIcon as LockClosedIconSolid,
  ArrowDownTrayIcon as ArrowDownTrayIconSolid,
  ChevronDownIcon as ChevronDownIconSolid2,
  ChevronUpIcon as ChevronUpIconSolid2,
  ChevronLeftIcon as ChevronLeftIconSolid2,
  ChevronRightIcon as ChevronRightIconSolid2,
  CircleStackIcon as CircleStackIconSolid2
} from '@heroicons/react/24/solid';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import BackButton from '../components/ui/BackButton';

// Mock data for visual demonstrations
const mockAnalyticsData = {
  engagement: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    data: [65, 78, 90, 85, 92, 88, 95],
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderColor: 'rgba(251, 191, 36, 1)',
  },
  attendance: {
    labels: ['Registered', 'Checked In', 'Completed', 'Feedback'],
    data: [120, 98, 85, 72],
    backgroundColor: [
      'rgba(59, 130, 246, 0.8)',
      'rgba(16, 185, 129, 0.8)',
      'rgba(251, 191, 36, 0.8)',
      'rgba(236, 72, 153, 0.8)'
    ],
  },
  sentiment: {
    positive: 65,
    neutral: 25,
    negative: 10,
  },
  topKeywords: [
    { word: 'Amazing', count: 45 },
    { word: 'Great', count: 38 },
    { word: 'Excellent', count: 32 },
    { word: 'Fantastic', count: 28 },
    { word: 'Wonderful', count: 25 },
  ],
  hourlyActivity: Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    activity: Math.floor(Math.random() * 50) + 10
  }))
};

const mockRegistrationData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'confirmed', team: 'Team Alpha', checkIn: true, payment: 'verified' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'confirmed', team: 'Team Beta', checkIn: true, payment: 'verified' },
  { id: 3, name: 'Mike Johnson', email: 'mike@example.com', status: 'pending', team: 'Team Gamma', checkIn: false, payment: 'pending' },
  { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', status: 'confirmed', team: 'Team Delta', checkIn: true, payment: 'verified' },
  { id: 5, name: 'David Brown', email: 'david@example.com', status: 'waiting', team: 'Team Epsilon', checkIn: false, payment: 'pending' },
];

const FeaturesPage = () => {
  const [activeSection, setActiveSection] = useState('eventManagement');
  const [expandedFeatures, setExpandedFeatures] = useState(new Set());
  const [selectedDemo, setSelectedDemo] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const toggleFeature = (featureId) => {
    const newExpanded = new Set(expandedFeatures);
    if (newExpanded.has(featureId)) {
      newExpanded.delete(featureId);
    } else {
      newExpanded.add(featureId);
    }
    setExpandedFeatures(newExpanded);
  };

  const handleExportDemo = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      // Simulate download
      const csvContent = "data:text/csv;charset=utf-8," +
        "Name,Email,Status,Team,Check-in,Payment\n" +
        "John Doe,john@example.com,confirmed,Team Alpha,Yes,Verified\n" +
        "Jane Smith,jane@example.com,confirmed,Team Beta,Yes,Verified\n" +
        "Mike Johnson,mike@example.com,pending,Team Gamma,No,Pending\n" +
        "Sarah Wilson,sarah@example.com,confirmed,Team Delta,Yes,Verified\n" +
        "David Brown,david@example.com,waiting,Team Epsilon,No,Pending";

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "event_participants.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1500);
  };

  const features = {
    eventManagement: {
      title: "Event Management",
      icon: CalendarIcon,
      description: "Complete event lifecycle management from creation to completion",
      color: "from-blue-500 to-cyan-500",
      features: [
        {
          id: "mega-events",
          title: "Mega Events with Sub-Events",
          description: "Create complex multi-session events with individual sub-events",
          demo: "hierarchical",
          icon: FireIcon
        },
        {
          id: "custom-registration",
          title: "Dynamic Custom Registration Forms",
          description: "Create tailored registration forms with custom fields",
          demo: "registration-table",
          icon: DocumentTextIcon
        },
        {
          id: "team-registration",
          title: "Team Registration System",
          description: "Advanced team management with flexible team sizes",
          demo: "team-management",
          icon: UserGroupIcon
        },
        {
          id: "waiting-list",
          title: "Smart Waiting List Management",
          description: "Automated waiting list with approval workflows",
          demo: "waiting-list",
          icon: ClockIcon
        }
      ]
    },
    analytics: {
      title: "Advanced Analytics & Insights",
      icon: ChartBarIcon,
      description: "Comprehensive analytics and reporting system",
      color: "from-purple-500 to-pink-500",
      features: [
        {
          id: "engagement-analytics",
          title: "Engagement Analytics",
          description: "Deep insights into event engagement patterns",
          demo: "engagement-chart",
          icon: ArrowTrendingUpIcon
        },
        {
          id: "attendance-tracking",
          title: "Attendance Tracking",
          description: "Comprehensive attendance and participation metrics",
          demo: "attendance-chart",
          icon: UserGroupIcon
        },
        {
          id: "data-export",
          title: "Data Export & Reporting",
          description: "Complete data export with multiple formats",
          demo: "export-demo",
          icon: ArrowDownTrayIcon
        },
        {
          id: "visual-charts",
          title: "Interactive Visual Charts",
          description: "Rich visualizations for data insights",
          demo: "sentiment-chart",
          icon: ChartBarIcon
        }
      ]
    },
    realTimeFeatures: {
      title: "Real-Time Engagement",
      icon: BoltIcon,
      description: "Live interaction and real-time updates",
      color: "from-green-500 to-emerald-500",
      features: [
        {
          id: "live-feedback",
          title: "Live Feedback System",
          description: "Real-time audience engagement during events",
          demo: "live-feedback",
          icon: ChatBubbleLeftEllipsisIcon
        },
        {
          id: "real-time-rsvp",
          title: "Real-Time RSVP Updates",
          description: "Instant RSVP tracking and notifications",
          demo: "rsvp-live",
          icon: BellIcon
        },
        {
          id: "socket-integration",
          title: "WebSocket Integration",
          description: "Real-time communication infrastructure",
          demo: "socket-demo",
          icon: BoltIcon
        }
      ]
    },
    paymentIntegration: {
      title: "Payment & QR Code System",
      icon: CreditCardIcon,
      description: "Complete payment solution with QR code integration",
      color: "from-orange-500 to-red-500",
      features: [
        {
          id: "qr-payment",
          title: "QR Code Payment System",
          description: "Seamless QR code-based payment processing",
          demo: "qr-demo",
          icon: QrCodeIcon
        },
        {
          id: "payment-verification",
          title: "Payment Verification & Approval",
          description: "Comprehensive payment proof review system",
          demo: "payment-verification",
          icon: CheckCircleIcon
        }
      ]
    }
  };

  const sections = Object.keys(features);

  // Demo Components
  const DemoComponent = ({ demoType }) => {
    switch (demoType) {
      case 'engagement-chart':
        return (
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h4 className="text-lg font-semibold text-white mb-4">Engagement Over Time</h4>
            <div className="h-48 flex items-end justify-between gap-2">
              {mockAnalyticsData.engagement.data.map((value, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-amber-400 to-amber-600 rounded-t-lg transition-all duration-300 hover:scale-105"
                    style={{ height: `${(value / 100) * 100}%` }}
                  />
                  <span className="text-xs text-gray-400 mt-2">{mockAnalyticsData.engagement.labels[index]}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'attendance-chart':
        return (
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h4 className="text-lg font-semibold text-white mb-4">Attendance Funnel</h4>
            <div className="space-y-4">
              {mockAnalyticsData.attendance.labels.map((label, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">{label}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${(mockAnalyticsData.attendance.data[index] / 120) * 100}%`,
                          backgroundColor: mockAnalyticsData.attendance.backgroundColor[index]
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-white w-8 text-right">
                      {mockAnalyticsData.attendance.data[index]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'sentiment-chart':
        return (
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h4 className="text-lg font-semibold text-white mb-4">Sentiment Analysis</h4>
            <div className="flex items-center justify-center h-32">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="8"
                    strokeDasharray={`${mockAnalyticsData.sentiment.positive * 2.51} 251`}
                    strokeDashoffset="0"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="8"
                    strokeDasharray={`${mockAnalyticsData.sentiment.neutral * 2.51} 251`}
                    strokeDashoffset={`-${mockAnalyticsData.sentiment.positive * 2.51}`}
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="8"
                    strokeDasharray={`${mockAnalyticsData.sentiment.negative * 2.51} 251`}
                    strokeDashoffset={`-${(mockAnalyticsData.sentiment.positive + mockAnalyticsData.sentiment.neutral) * 2.51}`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">100%</span>
                </div>
              </div>
              <div className="ml-6 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-sm text-gray-300">Positive: {mockAnalyticsData.sentiment.positive}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <span className="text-sm text-gray-300">Neutral: {mockAnalyticsData.sentiment.neutral}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="text-sm text-gray-300">Negative: {mockAnalyticsData.sentiment.negative}%</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'registration-table':
        return (
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-white">Registration Data</h4>
              <Button
                onClick={handleExportDemo}
                disabled={isExporting}
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                {isExporting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Exporting...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    Export CSV
                  </div>
                )}
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 text-gray-300 font-semibold">Name</th>
                    <th className="text-left py-3 text-gray-300 font-semibold">Status</th>
                    <th className="text-left py-3 text-gray-300 font-semibold">Team</th>
                    <th className="text-left py-3 text-gray-300 font-semibold">Check-in</th>
                    <th className="text-left py-3 text-gray-300 font-semibold">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {mockRegistrationData.map((row) => (
                    <tr key={row.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 text-white">{row.name}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          row.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                          row.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3 text-gray-300">{row.team}</td>
                      <td className="py-3">
                        {row.checkIn ? (
                          <CheckCircleIcon className="w-5 h-5 text-green-400" />
                        ) : (
                          <ClockIcon className="w-5 h-5 text-gray-400" />
                        )}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          row.payment === 'verified' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {row.payment}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'live-feedback':
        return (
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h4 className="text-lg font-semibold text-white mb-4">Live Feedback Stream</h4>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {[
                { user: 'John D.', message: 'Amazing presentation!', emoji: '🔥', time: '2 min ago' },
                { user: 'Sarah W.', message: 'Very informative session', emoji: '👍', time: '3 min ago' },
                { user: 'Mike J.', message: 'Great insights shared', emoji: '⭐', time: '4 min ago' },
                { user: 'Lisa K.', message: 'Love the interactive elements', emoji: '❤️', time: '5 min ago' },
                { user: 'David B.', message: 'Excellent content quality', emoji: '👏', time: '6 min ago' },
              ].map((feedback, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg animate-pulse">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-pink-400 rounded-full flex items-center justify-center text-sm font-bold text-white">
                    {feedback.user.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-white">{feedback.user}</span>
                      <span className="text-xs text-gray-400">{feedback.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-300">{feedback.message}</span>
                      <span className="text-lg">{feedback.emoji}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'qr-demo':
        return (
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h4 className="text-lg font-semibold text-white mb-4">QR Code Payment</h4>
            <div className="flex items-center justify-center">
              <div className="bg-white p-4 rounded-lg">
                <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                  <QrCodeIcon className="w-16 h-16 text-gray-600" />
                </div>
              </div>
              <div className="ml-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-gray-300">QR Code Generated</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-gray-300">Payment Verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-gray-300">Registration Confirmed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h4 className="text-lg font-semibold text-white mb-4">Interactive Demo</h4>
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChartBarIcon className="w-8 h-8 text-white" />
              </div>
              <p className="text-gray-300">Interactive visualization coming soon...</p>
            </div>
          </div>
        );
    }
  };

  const IconComponent = features[activeSection]?.icon;

  return (
    <div className="relative min-h-screen px-4 pt-28 pb-10 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
      {/* Ambient Glow Effects */}
      <div className="absolute top-0 left-[20%] w-96 h-96 bg-pink-500/10 rounded-full blur-[120px] z-0" />
      <div className="absolute bottom-10 right-[15%] w-72 h-72 bg-amber-400/10 rounded-full blur-[100px] z-0" />
      <div className="absolute bottom-0 left-[10%] w-60 h-60 bg-blue-400/10 rounded-full blur-[100px] z-0" />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <BackButton to="/" variant="subtle" label="Home" />
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
            EventPulse{' '}
            <span className="bg-gradient-to-r from-amber-300 to-pink-300 bg-clip-text text-transparent">
              Features
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Experience the power of modern event management with interactive visualizations and real-time insights
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {sections.map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeSection === section
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              {features[section].title}
            </button>
          ))}
        </div>

        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${features[activeSection]?.color} rounded-xl flex items-center justify-center`}>
              {IconComponent && <IconComponent className="w-6 h-6 text-white" />}
            </div>
            <h2 className="text-3xl font-bold text-white">{features[activeSection]?.title}</h2>
          </div>
          <p className="text-gray-300 max-w-2xl mx-auto">{features[activeSection]?.description}</p>
        </div>


        {/* Features Grid with Interactive Demos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {features[activeSection]?.features ? (
            features[activeSection].features.map((feature) => (
              <Card key={feature.id} className="group hover:scale-105 transition-all duration-500">
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-pink-400 rounded-xl flex items-center justify-center">
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-gray-300 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  {/* Interactive Demo */}
                  {feature.demo && (
                    <div className="mt-6">
                      <DemoComponent demoType={feature.demo} />
                    </div>
                  )}

                  {/* Expandable Details */}
                  <div className="mt-6">
                    <button
                      onClick={() => toggleFeature(feature.id)}
                      className="flex items-center gap-2 text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                    >
                      {expandedFeatures.has(feature.id) ? (
                        <>
                          <ChevronUpIcon className="w-4 h-4" />
                          Hide Details
                        </>
                      ) : (
                        <>
                          <ChevronDownIcon className="w-4 h-4" />
                          View Details
                        </>
                      )}
                    </button>

                    {expandedFeatures.has(feature.id) && (
                      <div className="mt-4 space-y-2 animate-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white/5 rounded-lg p-4">
                            <h5 className="font-semibold text-white mb-2">Key Benefits</h5>
                            <ul className="space-y-1 text-sm text-gray-300">
                              <li>• Real-time data processing</li>
                              <li>• Scalable architecture</li>
                              <li>• Secure data handling</li>
                            </ul>
                          </div>
                          <div className="bg-white/5 rounded-lg p-4">
                            <h5 className="font-semibold text-white mb-2">Technical Specs</h5>
                            <ul className="space-y-1 text-sm text-gray-300">
                              <li>• WebSocket integration</li>
                              <li>• RESTful API design</li>
                              <li>• Cloud-native deployment</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-2 text-center py-12">
              <p className="text-gray-400">No features available for this section.</p>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Your Events?
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of event organizers who trust EventPulse for their most important events.
              Start creating unforgettable experiences today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                as={Link}
                to="/register"
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Get Started Free
              </Button>
              <Button
                as={Link}
                to="/dashboard"
                size="lg"
                variant="outline"
                className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-white font-bold px-8 py-4 rounded-xl transition-all duration-300"
              >
                View Dashboard
              </Button>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: BoltIcon,
              title: "Real-Time",
              description: "Live updates and instant notifications"
            },
            {
              icon: ShieldCheckIcon,
              title: "Secure",
              description: "Enterprise-grade security and privacy"
            },
            {
              icon: ChartBarIcon,
              title: "Analytics",
              description: "Comprehensive insights and reporting"
            }
          ].map((highlight, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-pink-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <highlight.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{highlight.title}</h3>
              <p className="text-gray-300">{highlight.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;