import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  as: Component = 'button', 
  size = 'md',
  className = '',
  ...props 
}) => {
  const baseClasses = `
    inline-flex items-center justify-center
    rounded-xl font-semibold 
    backdrop-blur-md transition-all duration-300
    focus:outline-none focus:ring-2 focus:ring-offset-2
  `;

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };

  const variantClasses = {
    primary: `
      bg-white/10 text-white border border-white/20
      hover:bg-white/20 hover:border-white/40
      hover:scale-105 
      hover:shadow-[0_0_20px_4px_rgba(255,215,0,0.2),0_0_40px_8px_rgba(255,215,0,0.15)]
    `,
    secondary: `
      bg-amber-200/10 text-amber-300 border border-amber-300/20
      hover:bg-amber-200/20 hover:border-amber-400
      hover:text-amber-400 hover:scale-105 
      hover:shadow-[0_0_20px_4px_rgba(251,191,36,0.3),0_0_40px_8px_rgba(251,191,36,0.2)]
    `,
    outline: `
      bg-transparent text-white border border-white/30
      hover:bg-white/10 hover:border-white/50
      hover:scale-105 hover:shadow-[0_0_15px_rgba(255,255,255,0.15)]
    `,
    danger: `
      bg-red-500/10 text-red-400 border border-red-500/30
      hover:bg-red-500/20 hover:border-red-600
      hover:text-red-500 hover:scale-105 
      hover:shadow-[0_0_20px_4px_rgba(239,68,68,0.3)]
    `,
    ghost: `
      text-white hover:bg-white/10
    `
  };

  return (
    <Component 
      className={`
        ${baseClasses} 
        ${sizeClasses[size]} 
        ${variantClasses[variant]} 
        ${className}
      `}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Button;
