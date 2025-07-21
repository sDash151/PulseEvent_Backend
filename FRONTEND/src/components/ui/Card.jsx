import React from 'react';

/**
 * World-Class Card Component with Premium Glassmorphism
 * Features: Advanced hover effects, customizable appearance, micro-interactions
 */
const Card = ({ 
  children, 
  className = '', 
  title, 
  action, 
  shadow = 'lg',
  rounded = 'xl', 
  hoverEffect = true,
  gradient = false,
  padding = 'default',
  backdrop = 'default',
  border = 'default',
  as: Component = 'div', // default to div, allow 'form' or others
  ...props
}) => {
  // Shadow variations
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md', 
    lg: 'shadow-xl',
    xl: 'shadow-2xl',
    glow: 'shadow-[0_0_25px_rgba(255,255,255,0.1)]'
  };

  // Border radius variations
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-2xl',
    full: 'rounded-3xl'
  };

  // Padding variations
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  // Backdrop variations
  const backdropClasses = {
    none: 'bg-transparent',
    light: 'bg-white/5 backdrop-blur-sm',
    default: 'bg-white/5 backdrop-blur-md',
    heavy: 'bg-white/10 backdrop-blur-lg',
    dark: 'bg-black/10 backdrop-blur-md'
  };

  // Border variations
  const borderClasses = {
    none: 'border-0',
    light: 'border border-white/5',
    default: 'border border-white/10',
    heavy: 'border border-white/20',
    glow: 'border border-white/20 hover:border-amber-400/30'
  };

  const baseClasses = `
    relative overflow-hidden
    transition-all duration-300 ease-out
    ${roundedClasses[rounded]}
    ${shadowClasses[shadow]}
    ${backdropClasses[backdrop]}
    ${borderClasses[border]}
    ${hoverEffect ? 'hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1' : ''}
    ${gradient ? 'bg-gradient-to-br from-white/10 via-white/5 to-transparent' : ''}
  `;

  // If as="form", render a <form> and forward all props
  if (Component === 'form') {
    return (
      <form className={`${baseClasses} ${className}`} {...props}>
        {/* Subtle animated border glow */}
        {hoverEffect && (
          <div className="absolute inset-0 rounded-inherit bg-gradient-to-r from-transparent via-amber-400/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        )}
        {/* Card Header */}
        {(title || action) && (
          <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between backdrop-blur-sm bg-white/[0.02]">
            {title && (
              <h3 className="text-lg font-semibold text-white bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {title}
              </h3>
            )}
            {action && <div className="flex items-center gap-2">{action}</div>}
          </div>
        )}
        {/* Card Content */}
        <div className={`text-gray-200 ${paddingClasses[padding]}`}>
          {children}
        </div>
        {/* Hover highlight effect */}
        {hoverEffect && (
          <div className="absolute inset-0 rounded-inherit opacity-0 hover:opacity-5 bg-white transition-opacity duration-300 pointer-events-none" />
        )}
      </form>
    );
  }

  // Default: render as div
  return (
    <Component className={`${baseClasses} ${className}`} {...props}>
      {/* Subtle animated border glow */}
      {hoverEffect && (
        <div className="absolute inset-0 rounded-inherit bg-gradient-to-r from-transparent via-amber-400/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      )}
      {/* Card Header */}
      {(title || action) && (
        <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between backdrop-blur-sm bg-white/[0.02]">
          {title && (
            <h3 className="text-lg font-semibold text-white bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {title}
            </h3>
          )}
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      {/* Card Content */}
      <div className={`text-gray-200 ${paddingClasses[padding]}`}>
        {children}
      </div>
      {/* Hover highlight effect */}
      {hoverEffect && (
        <div className="absolute inset-0 rounded-inherit opacity-0 hover:opacity-5 bg-white transition-opacity duration-300 pointer-events-none" />
      )}
    </Component>
  );
};

export default Card;
