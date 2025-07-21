import React from 'react';
import PropTypes from 'prop-types';

/**
 * Universal Page Container Component
 * Provides consistent layout, spacing, and responsive design for all pages
 * Eliminates header overlap issues and ensures proper spacing
 */
const PageContainer = ({ 
  children, 
  className = '', 
  maxWidth = '7xl',
  padding = 'default',
  center = false,
  fullHeight = true,
  glassmorphic = false,
  noPadding = false
}) => {
  // Base container classes
  const baseClasses = 'w-full mx-auto relative z-10';
  
  // Max width options
  const maxWidthClasses = {
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    'full': 'max-w-full'
  };

  // Padding options
  const paddingClasses = {
    'none': '',
    'sm': 'px-4 py-4 sm:px-6 sm:py-6',
    'default': 'px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10',
    'lg': 'px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16',
    'xl': 'px-6 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20'
  };

  // Height classes
  const heightClasses = fullHeight ? 'min-h-[calc(100vh-7rem)] sm:min-h-[calc(100vh-8rem)] md:min-h-[calc(100vh-9rem)]' : '';
  
  // Center content classes
  const centerClasses = center ? 'flex flex-col justify-center items-center' : '';
  
  // Glassmorphic card classes
  const glassmorphicClasses = glassmorphic 
    ? 'bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_0_25px_rgba(255,255,255,0.06)] rounded-2xl' 
    : '';

  // No padding override
  const finalPaddingClasses = noPadding ? '' : paddingClasses[padding];

  const containerClasses = [
    baseClasses,
    maxWidthClasses[maxWidth],
    finalPaddingClasses,
    heightClasses,
    centerClasses,
    glassmorphicClasses,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {children}
    </div>
  );
};

PageContainer.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  maxWidth: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', 'full']),
  padding: PropTypes.oneOf(['none', 'sm', 'default', 'lg', 'xl']),
  center: PropTypes.bool,
  fullHeight: PropTypes.bool,
  glassmorphic: PropTypes.bool,
  noPadding: PropTypes.bool
};

export default PageContainer;
