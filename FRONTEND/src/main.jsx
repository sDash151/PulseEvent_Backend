import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { AuthProvider } from './context/AuthContext'; // ✅ Move here
import WhatsAppNotificationPopup from './components/WhatsAppNotificationPopup';
import RejectionNotificationPopup from './components/RejectionNotificationPopup';
import './index.css';

console.log('🚀 React app is starting...');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider> {/* ✅ Wrap the whole router */}
      <RouterProvider router={router} />
      <WhatsAppNotificationPopup />
      <RejectionNotificationPopup />
    </AuthProvider>
  </React.StrictMode>
);
