import React, { useState, useRef, useEffect } from 'react';

/**
 * World-Class Input Component with Premium UI/UX
 * Features: Floating labels, validation states, micro-interactions
 */
const Input = ({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  className = '',
  error = '',
  success = '',
  disabled = false,
  required = false,
  icon = null,
  iconPosition = 'left',
  size = 'md',
  variant = 'default',
  floatingLabel = false,
  ...props
}) => {
  try {
    // Catch-all log for debugging React error #137
    if (typeof value !== 'string' && typeof value !== 'number' && value !== undefined && value !== null) {
      console.error('[Input][CatchAll] Invalid value prop:', value, 'type:', typeof value, 'props:', { type, label, placeholder, value, ...props });
      console.trace();
    }
  } catch (err) {
    console.error('[Input][CatchAll] Exception during value type check:', err);
  }
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(Boolean(value));
  const inputRef = useRef(null);

  useEffect(() => {
    setHasValue(Boolean(value));
  }, [value]);

  const handleFocus = (e) => {
    setFocused(true);
    onFocus && onFocus(e);
  };

  const handleBlur = (e) => {
    setFocused(false);
    onBlur && onBlur(e);
  };

  const handleChange = (e) => {
    setHasValue(Boolean(e.target.value));
    onChange && onChange(e);
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  };

  // Variant classes
  const variantClasses = {
    default: `
      bg-white/10 backdrop-blur-md border border-white/20
      hover:border-white/30 focus:border-amber-400/60
      text-white placeholder-gray-400
    `,
    outline: `
      bg-transparent border-2 border-white/30
      hover:border-white/50 focus:border-amber-400
      text-white placeholder-gray-400
    `,
    filled: `
      bg-white/15 backdrop-blur-md border border-transparent
      hover:bg-white/20 focus:bg-white/25 focus:border-amber-400/60
      text-white placeholder-gray-400
    `
  };

  // State-based styling
  const getStateClasses = () => {
    if (error) {
      return 'border-red-400/60 hover:border-red-400/80 focus:border-red-400 focus:ring-red-400/30';
    }
    if (success) {
      return 'border-green-400/60 hover:border-green-400/80 focus:border-green-400 focus:ring-green-400/30';
    }
    return '';
  };

  const baseClasses = `
    w-full rounded-xl font-medium
    transition-all duration-300 ease-out
    focus:outline-none focus:ring-2 focus:ring-amber-400/30
    placeholder:transition-opacity placeholder:duration-300
    ${focused ? 'placeholder:opacity-60' : 'placeholder:opacity-100'}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${getStateClasses()}
  `;

  return (
    <div className="relative group">
      {/* Floating Label */}
      {floatingLabel && label && (
        <label
          className={`
            absolute left-4 pointer-events-none
            transition-all duration-300 ease-out origin-left
            ${focused || hasValue 
              ? 'top-2 text-xs text-amber-400 scale-90' 
              : `top-1/2 -translate-y-1/2 text-gray-400 ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'}`
            }
            ${error ? 'text-red-400' : success ? 'text-green-400' : ''}
          `}
        >
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}

      {/* Static Label */}
      {!floatingLabel && label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {icon}
          </div>
        )}

        {/* Input Field */}
        <input
          ref={inputRef}
          type={type}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={floatingLabel ? '' : placeholder}
          disabled={disabled}
          className={`
            ${baseClasses}
            ${icon && iconPosition === 'left' ? 'pl-10' : ''}
            ${icon && iconPosition === 'right' ? 'pr-10' : ''}
            ${className}
          `}
          {...props}
        />

        {/* Right Icon */}
        {icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {icon}
          </div>
        )}

        {/* Focus Glow Effect */}
        <div
          className={`
            absolute inset-0 rounded-xl pointer-events-none
            transition-opacity duration-300
            ${focused 
              ? error 
                ? 'shadow-[0_0_20px_rgba(239,68,68,0.2)] opacity-100' 
                : success 
                ? 'shadow-[0_0_20px_rgba(34,197,94,0.2)] opacity-100'
                : 'shadow-[0_0_20px_rgba(251,191,36,0.2)] opacity-100'
              : 'opacity-0'
            }
          `}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-1 mt-2 text-red-400 text-sm animate-slide-in-left">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-1 mt-2 text-green-400 text-sm animate-slide-in-left">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>{success}</span>
        </div>
      )}
    </div>
  );
};

export default Input;
