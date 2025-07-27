// Utility function to validate redirect URLs
export const validateRedirectUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Only allow internal routes starting with /
  if (!url.startsWith('/')) {
    return false;
  }

  // Prevent any potential security issues
  if (url.includes('://') || url.includes('javascript:') || url.includes('data:')) {
    return false;
  }

  // Only allow specific safe patterns
  const safePatterns = [
    /^\/$/, // Homepage
    /^\/events\/\d+$/, // Mega event pages
    /^\/dashboard$/, // Dashboard
    /^\/profile$/, // Profile
    /^\/my-registrations$/, // My registrations
  ];

  return safePatterns.some(pattern => pattern.test(url));
};

// Function to get safe redirect URL or fallback
export const getSafeRedirectUrl = (url, fallback = '/') => {
  return validateRedirectUrl(url) ? url : fallback;
}; 