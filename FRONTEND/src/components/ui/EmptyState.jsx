// frontend/src/components/ui/EmptyState.jsx
import Button from './Button'
import { Link } from 'react-router-dom'

const EmptyState = ({ title, description, actionText, actionLink }) => {
  return (
    <div className="text-center py-12">
      <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-gradient-to-br from-[#18132a] via-[#302b63] to-[#24243e] border border-white/10 relative">
        {/* Unique blurred gradient ring */}
        <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400/30 via-pink-500/20 to-blue-500/20 blur-[18px] scale-110"></span>
        {/* Slightly rotated SVG for playful effect */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 relative z-10 rotate-12" fill="none" viewBox="0 0 24 24">
          <defs>
            <linearGradient id="pulse-gradient-unique" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFC107" />
              <stop offset="0.5" stopColor="#FF4081" />
              <stop offset="1" stopColor="#2196F3" />
            </linearGradient>
          </defs>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} stroke="url(#pulse-gradient-unique)" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 className="mt-4 text-lg font-bold text-amber-300 drop-shadow-lg">{title}</h3>
      <p className="mt-1 text-base text-white/90 max-w-md mx-auto font-medium drop-shadow">{description}</p>
      <div className="mt-6">
        <Button as={Link} to={actionLink}>
          {actionText}
        </Button>
      </div>
    </div>
  )
}

export default EmptyState