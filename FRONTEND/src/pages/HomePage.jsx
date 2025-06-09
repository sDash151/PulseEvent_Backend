// frontend/src/pages/HomePage.jsx
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

const HomePage = () => {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  useEffect(() => {
    if (currentUser) {
      // Optionally, you can redirect to dashboard automatically
      // navigate('/dashboard')
    }
  }, [currentUser, navigate])

  return (
    <div className="gradient-bg min-h-[calc(100vh-4rem)] flex items-center">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
            Engage Your Audience in <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Real-Time</span>
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-10">
            EventPulse brings your events to life with instant RSVPs and live feedback. Perfect for conferences, workshops, and social gatherings.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button as={Link} to="/register" size="lg">Get Started Free</Button>
            <Button
              as={Link}
              to={currentUser ? "/dashboard" : "/login"}
              variant="outline"
              size="lg"
            >
              Demo Dashboard
            </Button>
          </div>
        </div>
        
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Real-Time RSVPs",
              description: "Watch as attendees confirm their participation instantly with live updates.",
              icon: "📝"
            },
            {
              title: "Live Feedback",
              description: "Capture audience sentiment during your event with emoji reactions and comments.",
              icon: "💬"
            },
            {
              title: "Powerful Analytics",
              description: "Gain insights into attendee engagement and feedback trends post-event.",
              icon: "📊"
            }
          ].map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HomePage