import React from 'react';

/**
 * World-Class Button Component with Ultimate UI/UX
 * Features: Premium glassmorphism, micro-interactions, accessibility
 */
const Button = ({ 
  children, 
  variant = 'primary', 
  as: Component = 'button', 
  size = 'md',
  className = '',
  shadow = true,
  rounded = true,
  loading = false,
  icon = null,
  iconPosition = 'left',
  disabled = false,
  ...props 
}) => {
  const baseClasses = `
    group relative inline-flex items-center justify-center gap-2
    ${rounded ? 'rounded-xl' : 'rounded-md'} font-semibold 
    backdrop-blur-md transition-all duration-300 transform overflow-hidden
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95 cursor-pointer'}
    focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:ring-offset-2 focus:ring-offset-transparent
    before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/5 before:via-white/10 before:to-white/5
    before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700
  `;

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm min-h-[2rem]",
    md: "px-4 py-2 text-base min-h-[2.5rem]",
    lg: "px-6 py-3 text-lg min-h-[3rem]"
  };

  const variantClasses = {
    primary: `
      bg-gradient-to-br from-white/10 via-white/5 to-transparent text-white 
      border border-white/20 shadow-lg
      hover:bg-gradient-to-br hover:from-white/20 hover:via-white/10 hover:to-white/5
      hover:border-white/40 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]
      ${shadow ? 'shadow-[0_8px_25px_rgba(0,0,0,0.1)]' : ''}
    `,
    secondary: `
      bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-transparent 
      text-amber-300 border border-amber-300/30 shadow-md
      hover:bg-gradient-to-br hover:from-amber-500/20 hover:via-amber-400/10 hover:to-amber-300/5
      hover:border-amber-400/50 hover:text-amber-200
      hover:shadow-[0_0_30px_rgba(251,191,36,0.3)]
      ${shadow ? 'shadow-[0_8px_20px_rgba(251,191,36,0.1)]' : ''}
    `,
    outline: `
      bg-transparent text-white border border-white/30
      hover:bg-white/10 hover:border-white/50
      hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]
      ${shadow ? 'shadow-md' : ''}
    `,
    danger: `
      bg-gradient-to-br from-red-500/10 via-red-400/5 to-transparent
      text-red-400 border border-red-500/30 shadow-md
      hover:bg-gradient-to-br hover:from-red-500/20 hover:via-red-400/10 hover:to-red-300/5
      hover:border-red-400/50 hover:text-red-300
      hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]
      ${shadow ? 'shadow-[0_8px_20px_rgba(239,68,68,0.1)]' : ''}
    `,
    success: `
      bg-gradient-to-br from-green-500/10 via-green-400/5 to-transparent
      text-green-400 border border-green-500/30 shadow-md
      hover:bg-gradient-to-br hover:from-green-500/20 hover:via-green-400/10 hover:to-green-300/5
      hover:border-green-400/50 hover:text-green-300
      hover:shadow-[0_0_30px_rgba(34,197,94,0.3)]
      ${shadow ? 'shadow-[0_8px_20px_rgba(34,197,94,0.1)]' : ''}
    `,
    ghost: `
      text-white hover:bg-white/10 hover:shadow-md
      transition-all duration-200
    `,
    gradient: `
      bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500
      text-white border-0 shadow-lg
      hover:from-amber-600 hover:via-orange-600 hover:to-pink-600
      hover:shadow-[0_0_40px_rgba(251,191,36,0.4)]
      ${shadow ? 'shadow-[0_8px_25px_rgba(251,191,36,0.3)]' : ''}
    `
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
  );

  return (
    <Component 
      className={`
        ${baseClasses} 
        ${sizeClasses[size]} 
        ${variantClasses[variant]} 
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {/* Loading State */}
      {loading && (
        <>
          <LoadingSpinner />
          <span className="opacity-75">Loading...</span>
        </>
      )}
      
      {/* Normal State with Icon Support */}
      {!loading && (
        <>
          {icon && iconPosition === 'left' && (
            <span className="flex-shrink-0">{icon}</span>
          )}
          <span className="relative z-10">{children}</span>
          {icon && iconPosition === 'right' && (
            <span className="flex-shrink-0">{icon}</span>
          )}
        </>
      )}
      
      {/* Ripple Effect on Click */}
      <span className="absolute inset-0 rounded-inherit opacity-0 group-active:opacity-20 bg-white transition-opacity duration-150" />
    </Component>
  );
};

export default Button;
