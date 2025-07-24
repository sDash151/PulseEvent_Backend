import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDownIcon, ChevronUpIcon, MagnifyingGlassIcon, BookOpenIcon, UserGroupIcon, CalendarIcon, ChartBarIcon, CogIcon, ShieldCheckIcon, QuestionMarkCircleIcon, LightBulbIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import FormattedContent from '../components/FormattedContent';

const HelpCenterPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState(new Set(['getting-started']));
  const [expandedFAQs, setExpandedFAQs] = useState(new Set());

  const toggleSection = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const toggleFAQ = (faqId) => {
    const newExpanded = new Set(expandedFAQs);
    if (newExpanded.has(faqId)) {
      newExpanded.delete(faqId);
    } else {
      newExpanded.add(faqId);
    }
    setExpandedFAQs(newExpanded);
  };

  const faqData = {
    'getting-started': {
      title: 'Getting Started',
      icon: BookOpenIcon,
      faqs: [
        {
          id: 'gs-1',
          question: 'How do I create my first event?',
          answer: 'To create your first event, click on "Create Event" in the navigation menu. Fill in the event details including title, description, location, date/time, and maximum attendees. You can also enable features like payment requirements, WhatsApp group, and team events. Once created, you can manage registrations and track attendance.'
        },
        {
          id: 'gs-2',
          question: 'What is the difference between a Mega Event and a Sub Event?',
          answer: 'A Mega Event is a main event that can contain multiple Sub Events. Think of it as a conference with multiple sessions. Mega Events help you organize complex events with multiple activities, while Sub Events are individual sessions within that main event. Users can register for the Mega Event and then choose which Sub Events to attend.'
        },
        {
          id: 'gs-3',
          question: 'How do I invite people to my event?',
          answer: 'You can invite people by email through the "Invitations" section. Enter their email addresses and they will receive an invitation link. You can also share your event link directly on social media or messaging platforms. For team events, participants can register as a team with multiple members.'
        }
      ]
    },
    'event-management': {
      title: 'Event Management',
      icon: CalendarIcon,
      faqs: [
        {
          id: 'em-1',
          question: 'How do I manage registrations for my event?',
          answer: 'Go to your event dashboard and click on "Review Registrations". Here you can see all registered participants, approve/reject registrations, and manage waiting lists. You can also export participant data as CSV or JSON for external use. For team events, you can manage individual team members.'
        },
        {
          id: 'em-2',
          question: 'Can I set up payment requirements for my event?',
          answer: 'Yes! When creating an event, you can enable "Payment Required" and upload a QR code for payment. Participants will need to upload payment proof during registration. You can review and approve payment proofs in the registration management section.'
        },
        {
          id: 'em-3',
          question: 'How do I create team events?',
          answer: 'When creating an event, set the team size (e.g., 2-4 members). You can make it flexible or fixed. Participants can then register as a team and add team member details. You can track both individual and team registrations in your dashboard.'
        },
        {
          id: 'em-4',
          question: 'How do I set up WhatsApp group integration?',
          answer: 'Enable "WhatsApp Group" in your event settings and add your WhatsApp group invite link. Participants will see a "Join Group Chat" option in the event details. This helps facilitate communication between event participants.'
        }
      ]
    },
    'analytics-insights': {
      title: 'Analytics & Insights',
      icon: ChartBarIcon,
      faqs: [
        {
          id: 'ai-1',
          question: 'What analytics are available for my events?',
          answer: 'EventPulse provides comprehensive analytics including attendance tracking, feedback sentiment analysis, engagement heatmaps, popular keywords from feedback, user demographics, and registration trends. You can view these insights in the Analytics section of your dashboard.'
        },
        {
          id: 'ai-2',
          question: 'How do I track real-time attendance?',
          answer: 'Use the check-in feature during your event. Participants can check in through the event page, and you can see real-time attendance updates in your dashboard. The system also tracks feedback participation and engagement metrics.'
        },
        {
          id: 'ai-3',
          question: 'Can I export participant data?',
          answer: 'Yes! In the Analytics section, you can export participant data in multiple formats: Clean CSV (basic info), Complete CSV (all details), and JSON format. This is useful for external analysis or record keeping.'
        }
      ]
    },
    'user-management': {
      title: 'User Management',
      icon: UserGroupIcon,
      faqs: [
        {
          id: 'um-1',
          question: 'How do I manage user roles and permissions?',
          answer: 'EventPulse has different user roles: Host (event creator), Attendee (participant), and Admin. Hosts can manage their events, review registrations, and access analytics. Attendees can register for events and provide feedback. Role permissions are automatically managed based on event ownership.'
        },
        {
          id: 'um-2',
          question: 'Can I customize registration forms?',
          answer: 'Yes! You can add custom fields to your registration forms. These can include questions, preferences, dietary requirements, or any other information you need from participants. Custom fields are stored as JSON and can be exported with participant data.'
        },
        {
          id: 'um-3',
          question: 'How do I handle waiting lists?',
          answer: 'When your event reaches capacity, new registrations automatically go to the waiting list. You can review and approve waiting list entries, moving them to confirmed status. The system tracks waiting list status and notifies participants of changes.'
        }
      ]
    },
    'technical-support': {
      title: 'Technical Support',
      icon: CogIcon,
      faqs: [
        {
          id: 'ts-1',
          question: 'What browsers are supported?',
          answer: 'EventPulse works on all modern browsers including Chrome, Firefox, Safari, and Edge. For the best experience, we recommend using the latest version of your browser. The platform is also mobile-responsive for on-the-go event management.'
        },
        {
          id: 'ts-2',
          question: 'How do I reset my password?',
          answer: 'If you forget your password, click on "Forgot Password" on the login page. Enter your email address and you will receive a password reset link. Make sure to check your spam folder if you don\'t see the email immediately.'
        },
        {
          id: 'ts-3',
          question: 'Is my data secure?',
          answer: 'Yes! EventPulse uses industry-standard security measures including encrypted data transmission, secure authentication, and regular security updates. Your event data and participant information are protected and never shared with third parties.'
        },
        {
          id: 'ts-4',
          question: 'How do I contact support?',
          answer: 'For technical support, you can contact us through our support portal or email. We typically respond within 24 hours. For urgent issues during live events, please include your event ID and specific problem description.'
        }
      ]
    },
    'best-practices': {
      title: 'Best Practices',
      icon: LightBulbIcon,
      faqs: [
        {
          id: 'bp-1',
          question: 'How can I increase event engagement?',
          answer: 'Use the feedback system during your event to gather real-time responses. Enable WhatsApp group integration for better communication. Create engaging event descriptions and use the analytics to understand participant behavior. Regular check-ins and interactive elements also boost engagement.'
        },
        {
          id: 'bp-2',
          question: 'What\'s the best way to manage large events?',
          answer: 'For large events, use the Mega Event structure with multiple Sub Events. Enable team registrations to reduce individual sign-ups. Use the waiting list feature and set up clear communication channels. Export data regularly for external management tools.'
        },
        {
          id: 'bp-3',
          question: 'How do I ensure smooth event day operations?',
          answer: 'Test all features before your event day. Set up check-in stations and train volunteers on the system. Have backup plans for technical issues. Use the real-time analytics to monitor attendance and engagement during the event.'
        }
      ]
    }
  };

  const filteredSections = Object.entries(faqData).filter(([sectionId, section]) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return section.title.toLowerCase().includes(searchLower) ||
           section.faqs.some(faq => 
             faq.question.toLowerCase().includes(searchLower) ||
             faq.answer.toLowerCase().includes(searchLower)
           );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent"></div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl">
                <QuestionMarkCircleIcon className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
              Help Center
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Find answers to all your questions about EventPulse. From getting started to advanced features, we've got you covered.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-md mx-auto mb-12">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for help topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Sections */}
      <div className="container mx-auto px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          {filteredSections.length === 0 ? (
            <div className="text-center py-20">
              <ExclamationTriangleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No results found</h3>
              <p className="text-gray-400">Try adjusting your search terms or browse all categories below.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredSections.map(([sectionId, section]) => {
                const IconComponent = section.icon;
                return (
                  <div key={sectionId} className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
                    {/* Section Header */}
                    <button
                      onClick={() => toggleSection(sectionId)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-semibold text-white">{section.title}</h2>
                      </div>
                      {expandedSections.has(sectionId) ? (
                        <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </button>

                    {/* Section Content */}
                    {expandedSections.has(sectionId) && (
                      <div className="px-6 pb-6">
                        <div className="space-y-4">
                          {section.faqs.map((faq) => (
                            <div key={faq.id} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                              <button
                                onClick={() => toggleFAQ(faq.id)}
                                className="w-full px-4 py-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                              >
                                <span className="font-medium text-white pr-4">{faq.question}</span>
                                {expandedFAQs.has(faq.id) ? (
                                  <ChevronUpIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                ) : (
                                  <ChevronDownIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                )}
                              </button>
                              {expandedFAQs.has(faq.id) && (
                                <div className="px-4 pb-4">
                                  <FormattedContent content={faq.answer} />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Contact Support Section */}
      <div className="container mx-auto px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-md rounded-2xl border border-amber-500/20 p-8 text-center">
            <ShieldCheckIcon className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">Still Need Help?</h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Can't find what you're looking for? Our support team is here to help you with any questions or issues you might have.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://souravdash151.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all transform hover:scale-105 shadow-lg"
              >
                Contact Support
              </a>
              <Link
                to="/"
                className="inline-flex items-center justify-center px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 hover:border-white/40 transition-all"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPage; 