import React from 'react';

/**
 * Compact and elegant ErrorMessage component with minimal vertical footprint
 * @param {Object} props - Component props
 * @param {string} props.error - Error message to display
 * @param {string} props.type - Error type ('error', 'warning', 'info', 'success')
 * @param {number} props.errorId - Unique ID for animation key
 * @param {Function} props.onDismiss - Function to call when error is dismissed
 * @param {boolean} props.showDismiss - Whether to show dismiss button (default: true)
 * @param {string} props.className - Additional CSS classes
 */
const ErrorMessage = ({ 
  error, 
  type = 'error', 
  errorId = 0, 
  onDismiss, 
  showDismiss = true,
  className = '' 
}) => {
  if (!error) return null;

  // Define compact styles based on error type
  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-green-500/10 border-green-500/20 text-green-400',
          icon: 'text-green-400',
          iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
        };
      case 'warning':
        return {
          container: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
          icon: 'text-yellow-400',
          iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
        };
      case 'info':
        return {
          container: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
          icon: 'text-blue-400',
          iconPath: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
        };
      default: // error
        return {
          container: 'bg-red-500/10 border-red-500/20 text-red-400',
          icon: 'text-red-400',
          iconPath: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
        };
    }
  };

  const styles = getStyles();

  return (
    <div 
      key={errorId}
      className={`mb-4 p-3 rounded-lg border animate-error-slide-in ${styles.container} ${className}`}
    >
      <div className="flex items-center gap-2.5">
        {/* Compact Icon */}
        <div className="flex-shrink-0">
          <svg className={`w-4 h-4 ${styles.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={styles.iconPath} />
          </svg>
        </div>
        
        {/* Compact Message */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-tight">{error}</p>
          
          {/* Additional context for specific error types */}
          {type === 'info' && (
            <p className="text-xs text-blue-300 mt-0.5 leading-tight">
              Don't have an account? Create one to get started!
            </p>
          )}
          {type === 'success' && (
            <p className="text-xs text-green-300 mt-0.5 leading-tight">
              You already have an account! Please sign in instead.
            </p>
          )}
        </div>
        
        {/* Compact Dismiss Button */}
        {showDismiss && onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-white transition-colors duration-200 p-0.5 rounded"
            aria-label="Dismiss message"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage; 