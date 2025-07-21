import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ 
  to, 
  onClick, 
  label = "Back",
  className = "",
  variant = "default",
  showIcon = true,
  ...props 
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  const baseClasses = `
    inline-flex items-center gap-2
    px-4 py-2.5 rounded-xl font-semibold
    backdrop-blur-md transition-all duration-300
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400
    hover:scale-105 active:scale-95
    group
  `;

  const variantClasses = {
    default: `
      bg-white/10 text-white border border-white/20
      hover:bg-white/20 hover:border-white/40
      hover:shadow-[0_0_20px_4px_rgba(255,215,0,0.2),0_0_40px_8px_rgba(255,215,0,0.15)]
    `,
    subtle: `
      bg-transparent text-gray-300 border border-gray-600/30
      hover:bg-white/5 hover:border-gray-500/50 hover:text-white
      hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]
    `,
    amber: `
      bg-amber-200/10 text-amber-300 border border-amber-300/20
      hover:bg-amber-200/20 hover:border-amber-400
      hover:text-amber-400
      hover:shadow-[0_0_20px_4px_rgba(251,191,36,0.3),0_0_40px_8px_rgba(251,191,36,0.2)]
    `,
    floating: `
      bg-white/5 text-white border border-white/10
      hover:bg-white/15 hover:border-white/30
      shadow-lg backdrop-blur-xl
      hover:shadow-[0_0_25px_rgba(255,255,255,0.15)]
    `
  };

  return (
    <button
      onClick={handleClick}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${className}
      `}
      aria-label={`Go back ${label ? `to ${label}` : ''}`}
      {...props}
    >
      {showIcon && (
        <svg 
          className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 19l-7-7 7-7"
          />
        </svg>
      )}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
};

export default BackButton; 