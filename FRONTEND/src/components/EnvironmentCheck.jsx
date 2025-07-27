import React from 'react';

const EnvironmentCheck = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const nodeEnv = import.meta.env.MODE;
  
  // Only show in development
  if (nodeEnv !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs z-50">
      <div className="font-bold mb-2">Environment Check:</div>
      <div>API Base URL: {apiBaseUrl || 'NOT SET'}</div>
      <div>Mode: {nodeEnv}</div>
    </div>
  );
};

export default EnvironmentCheck; 