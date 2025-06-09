// frontend/src/components/layout/Footer.jsx
const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"></div>
              <span className="text-lg font-bold">EventPulse</span>
            </div>
            <p className="mt-2 text-gray-400 text-sm">Real-time RSVP & Feedback Platform</p>
          </div>
          
          <div className="flex flex-col items-center md:items-end">
            <p className="text-gray-400">© {new Date().getFullYear()} EventPulse. All rights reserved.</p>
            <div className="flex space-x-4 mt-2">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer