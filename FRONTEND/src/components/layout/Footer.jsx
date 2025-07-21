// frontend/src/components/layout/Footer.jsx
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-b from-gray-900 to-black pt-16 pb-8 overflow-hidden">
      
      {/* Floating elements */}
      <div className="absolute inset-0 z-0">
        {[...Array(8)].map((_, i) => (
          <div 
            key={i}
            className="absolute bg-gradient-to-br from-amber-500/10 to-orange-500/10 w-24 h-12 rounded-md shadow-lg border border-amber-500/20 transform rotate-12"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float-ticket ${Math.random() * 15 + 15}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: Math.random() * 0.4 + 0.1
            }}
          >
            <div className="w-4/5 h-0.5 bg-amber-500/30 rounded-full mx-auto mt-3"></div>
          </div>
        ))}
        
        {/* Spotlight effect */}
        <div className="absolute -top-32 left-1/4 w-64 h-64 bg-gradient-to-b from-amber-500/10 to-transparent rounded-full mix-blend-soft-light filter blur-[100px]"></div>
      </div>
      
      <div className="container relative z-10 mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={import.meta.env.BASE_URL + 'assets/logo2.png'} alt="EventPulse Logo" className="w-10 h-10 rounded-full shadow-lg object-cover" />
              <span className="text-xl font-bold bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
                EventPulse
              </span>
            </div>
            <p className="text-gray-400 mb-6 max-w-xs">
              Revolutionizing event management with real-time engagement tools for unforgettable experiences.
            </p>
            
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-amber-400 hover:bg-gray-700 transition-all" aria-label="Twitter">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-amber-400 hover:bg-gray-700 transition-all" aria-label="Facebook">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-amber-400 hover:bg-gray-700 transition-all" aria-label="Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608C4.515 2.497 5.782 2.225 7.148 2.163 8.414 2.105 8.794 2.163 12 2.163zm0-2.163C8.741 0 8.332.012 7.052.07 5.771.128 4.659.334 3.678 1.315c-.98.98-1.187 2.092-1.245 3.373C2.012 5.668 2 6.077 2 12c0 5.923.012 6.332.07 7.612.058 1.281.265 2.393 1.245 3.373.98.98 2.092 1.187 3.373 1.245C8.332 23.988 8.741 24 12 24s3.668-.012 4.948-.07c1.281-.058 2.393-.265 3.373-1.245.98-.98 1.187-2.092 1.245-3.373.058-1.28.07-1.689.07-7.612 0-5.923-.012-6.332-.07-7.612-.058-1.281-.265-2.393-1.245-3.373-.98-.98-2.092-1.187-3.373-1.245C15.668.012 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-amber-400 hover:bg-gray-700 transition-all" aria-label="LinkedIn">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11.75 20h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm15.25 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.968v5.699h-3v-10h2.881v1.367h.041c.401-.761 1.381-1.563 2.844-1.563 3.042 0 3.604 2.003 3.604 4.605v5.591z" />
                </svg>
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b border-amber-500/30 inline-block">Quick Links</h3>
            <ul className="space-y-3">
              {['Home', 'Features', 'Pricing', 'About Us', 'Contact'].map((item) => (
                <li key={item}>
                  {item === 'Contact' ? (
                    <a
                      href="https://souravdash151.netlify.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-amber-400 transition-colors flex items-center group"
                    >
                      <span className="w-2 h-2 bg-amber-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      {item}
                    </a>
                  ) : (
                    <Link
                      to={
                        item === 'Home' ? '/' :
                        item === 'Features' ? '/features' :
                        item === 'Pricing' ? '/pricing' :
                        item === 'About Us' ? '/about' :
                        '/'
                      }
                      className="text-gray-400 hover:text-amber-400 transition-colors flex items-center group"
                    >
                      <span className="w-2 h-2 bg-amber-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      {item}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b border-amber-500/30 inline-block">Resources</h3>
            <ul className="space-y-3">
              {['Blog', 'Documentation', 'Help Center', 'Community', 'Webinars'].map((item) => (
                <li key={item}>
                  <Link
                    to={
                      item === 'Blog' ? '/blog' :
                      item === 'Documentation' ? '/documentation' :
                      item === 'Help Center' ? '/help-center' :
                      item === 'Community' ? '/community' :
                      item === 'Webinars' ? '/webinars' :
                      '/'
                    }
                    className="text-gray-400 hover:text-amber-400 transition-colors flex items-center group"
                  >
                    <span className="w-2 h-2 bg-amber-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Newsletter */}
          <div className="max-w-xs ml-0">
            <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b border-amber-500/30 inline-block">Stay Updated</h3>
            <p className="text-gray-400 mb-4">
              Subscribe to our newsletter for event tips and updates.
            </p>
            <form className="flex flex-col sm:flex-row items-stretch gap-2">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-grow bg-gray-800 border border-gray-700 text-white py-2 px-4 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent min-w-0"
              />
              <button type="submit" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-2 px-4 rounded-r-lg transition-all whitespace-nowrap">
                Subscribe
              </button>
            </form>
            <p className="text-gray-500 text-xs mt-2">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 mb-4 md:mb-0">
              © {new Date().getFullYear()} EventPulse. All rights reserved.
            </p>
            
            <div className="flex space-x-6">
              {['Terms', 'Privacy', 'Cookies', 'Contact'].map((item) => (
                item === 'Contact' ? (
                  <a
                    key={item}
                    href="https://souravdash151.netlify.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-amber-400 transition-colors"
                  >
                    {item}
                  </a>
                ) : (
                  <Link
                    key={item}
                    to={
                      item === 'Terms' ? '/terms' :
                      item === 'Privacy' ? '/privacy' :
                      item === 'Cookies' ? '/cookies' :
                      '/'
                    }
                    className="text-gray-500 hover:text-amber-400 transition-colors"
                  >
                    {item}
                  </Link>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer;