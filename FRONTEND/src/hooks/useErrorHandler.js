import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook for managing error states with persistence and smart clearing
 * @param {number} autoClearDelay - Time in milliseconds before auto-clearing (default: 15000)
 * @returns {Object} Error management functions and state
 */
export const useErrorHandler = (autoClearDelay = 15000) => {
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState('error'); // 'error', 'warning', 'info', 'success'
  const [errorId, setErrorId] = useState(0);
  const [errorDismissed, setErrorDismissed] = useState(false);
  const [lastTriggerValue, setLastTriggerValue] = useState('');
  
  const clearErrorTimeoutRef = useRef(null);
  const errorSourceRef = useRef(''); // Track error source: 'submit', 'validation', 'network'
  const inputChangeTimeoutRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clearErrorTimeoutRef.current) {
        clearTimeout(clearErrorTimeoutRef.current);
      }
      if (inputChangeTimeoutRef.current) {
        clearTimeout(inputChangeTimeoutRef.current);
      }
    };
  }, []);

  // Clear error with proper cleanup
  const clearError = useCallback(() => {
    setError('');
    setErrorType('error');
    setErrorDismissed(false);
    setLastTriggerValue('');
    errorSourceRef.current = '';
    
    // Clear all timeouts
    if (clearErrorTimeoutRef.current) {
      clearTimeout(clearErrorTimeoutRef.current);
      clearErrorTimeoutRef.current = null;
    }
    if (inputChangeTimeoutRef.current) {
      clearTimeout(inputChangeTimeoutRef.current);
      inputChangeTimeoutRef.current = null;
    }
  }, []);

  // Check if error should persist based on type
  const shouldPersistError = useCallback((errorMessage) => {
    const persistentErrors = [
      'No account found',
      'create an account first',
      'already exists',
      'sign in instead',
      'account not found',
      'user not found',
      'Invalid credentials',
      'Login failed',
      'Authentication failed'
    ];
    
    return persistentErrors.some(persistentError => 
      errorMessage.toLowerCase().includes(persistentError.toLowerCase())
    );
  }, []);

  // Set error with persistence and source tracking
  const setErrorWithPersistence = useCallback((errorMessage, type = 'error', triggerValue = '', source = 'general') => {
    // Clear any existing timeouts
    if (clearErrorTimeoutRef.current) {
      clearTimeout(clearErrorTimeoutRef.current);
    }
    if (inputChangeTimeoutRef.current) {
      clearTimeout(inputChangeTimeoutRef.current);
    }

    setError(errorMessage);
    setErrorType(type);
    setErrorId(prev => prev + 1);
    setErrorDismissed(false);
    setLastTriggerValue(triggerValue);
    errorSourceRef.current = source;

    // Always set timeout, but check conditions inside the callback
    clearErrorTimeoutRef.current = setTimeout(() => {
      // Check if error should be cleared based on current state
      const isPersistent = shouldPersistError(errorMessage);
      const isSubmitError = source === 'submit';
      
      if (!isPersistent && !isSubmitError && !errorDismissed) {
        clearError();
      }
    }, autoClearDelay);
  }, [autoClearDelay, errorDismissed, shouldPersistError, clearError]);

  // Manual error dismissal
  const dismissError = useCallback(() => {
    setErrorDismissed(true);
    clearError();
  }, [clearError]);

  // Smart input change handler with debouncing and source awareness
  const handleInputChange = useCallback((newValue, fieldType = 'general') => {
    // Clear any existing input change timeout
    if (inputChangeTimeoutRef.current) {
      clearTimeout(inputChangeTimeoutRef.current);
    }

    // Don't clear submit errors or manually dismissed errors
    if (!error || errorDismissed || errorSourceRef.current === 'submit') {
      return;
    }

    // Don't clear persistent errors through input changes
    if (shouldPersistError(error)) {
      return;
    }

    // Debounced clearing logic - only for validation errors
    inputChangeTimeoutRef.current = setTimeout(() => {
      if (error && !errorDismissed && errorSourceRef.current === 'validation') {
        const currentTriggerValue = lastTriggerValue.toLowerCase();
        const newValueLower = newValue.toLowerCase();
        
        // Different clearing logic based on field type
        switch (fieldType) {
          case 'email':
            // Clear if email format looks more valid or field is cleared
            if (newValueLower !== currentTriggerValue && 
                (newValueLower.length === 0 || 
                 (newValueLower.includes('@') && newValueLower.length >= 5))) {
              clearError();
            }
            break;
          case 'password':
            // Clear after user types a few characters (indicating they're fixing it)
            if (newValue.length >= 3) {
              clearError();
            }
            break;
          case 'name':
            // Clear if user starts typing name
            if (newValue.length >= 2) {
              clearError();
            }
            break;
          default:
            // General case: clear if value is significantly different
            if (newValueLower !== currentTriggerValue && 
                (newValueLower.length === 0 || newValueLower.length >= 3)) {
              clearError();
            }
        }
      }
    }, 800); // 800ms debounce delay
  }, [error, errorDismissed, lastTriggerValue, shouldPersistError, clearError]);

  // Enhanced error setter with smart persistence and source tracking
  const setSmartError = useCallback((errorMessage, triggerValue = '', source = 'submit') => {
    const isPersistent = shouldPersistError(errorMessage);
    const type = isPersistent ? 'info' : 'error';
    
    setErrorWithPersistence(errorMessage, type, triggerValue, source);
  }, [shouldPersistError, setErrorWithPersistence]);

  // Validation error setter (clears more easily)
  const setValidationError = useCallback((errorMessage, triggerValue = '') => {
    setErrorWithPersistence(errorMessage, 'warning', triggerValue, 'validation');
  }, [setErrorWithPersistence]);

  // Network error setter (persists longer)
  const setNetworkError = useCallback((errorMessage, triggerValue = '') => {
    setErrorWithPersistence(errorMessage, 'error', triggerValue, 'network');
  }, [setErrorWithPersistence]);

  return {
    // State
    error,
    errorType,
    errorId,
    errorDismissed,
    lastTriggerValue,
    errorSource: errorSourceRef.current,
    
    // Actions
    clearError,
    setError: setErrorWithPersistence,
    setSmartError,
    setValidationError,
    setNetworkError,
    dismissError,
    handleInputChange,
    
    // Utilities
    shouldPersistError,
    hasError: !!error,
    isPersistentError: !!error && shouldPersistError(error)
  };
};