import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

/**
 * World-Class Modal Component with Premium UI/UX
 * Features: Advanced animations, backdrop blur, accessibility
 */
const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  backdrop = 'blur',
  animation = 'scale',
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = '',
  overlayClassName = '',
  contentClassName = ''
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && closeOnEscape && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  // Size variations
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
    full: 'max-w-[90vw] max-h-[90vh]'
  };

  // Backdrop variations
  const backdropClasses = {
    none: 'bg-black/50',
    dark: 'bg-black/70',
    blur: 'bg-black/40 backdrop-blur-md',
    heavy: 'bg-black/60 backdrop-blur-lg'
  };

  // Animation variations
  const animationClasses = {
    scale: 'animate-bounce-in',
    slide: 'animate-slide-in-right',
    fade: 'animate-fade-in'
  };

  const modalContent = (
    <div 
      className={`
        fixed inset-0 z-[200] flex items-center justify-center p-4
        ${backdropClasses[backdrop]} ${overlayClassName}
      `}
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      {/* Modal Container */}
      <div
        className={`
          relative w-full ${sizeClasses[size]}
          bg-gradient-to-br from-gray-800/95 via-gray-900/95 to-black/95
          backdrop-blur-xl border border-white/10
          rounded-2xl shadow-2xl
          ${animationClasses[animation]}
          ${contentClassName}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative gradient border */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-400/20 via-transparent to-pink-400/20 p-[1px] pointer-events-none">
          <div className="w-full h-full rounded-2xl bg-gradient-to-br from-gray-800/95 via-gray-900/95 to-black/95" />
        </div>

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="relative flex items-center justify-between p-6 border-b border-white/10">
            {title && (
              <h2 className="text-xl font-bold text-white bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {title}
              </h2>
            )}
            
            {showCloseButton && (
              <button
                onClick={onClose}
                className="
                  ml-auto p-2 rounded-xl bg-white/10 border border-white/20
                  text-gray-400 hover:text-white hover:bg-white/20
                  transition-all duration-200 hover:scale-105
                  focus:outline-none focus:ring-2 focus:ring-amber-400/50
                "
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className={`relative p-6 text-gray-200 ${className}`}>
          {children}
        </div>

        {/* Subtle inner glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 via-transparent to-white/5 pointer-events-none" />
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default Modal;
