// src/router.jsx
import React from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  Navigate,
} from 'react-router-dom';

import ProtectedRoute from './components/ui/ProtectedRoute';
import Layout from './components/layout/Layout';

import ComingSoonPage from './pages/ComingSoonPage';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CreateEventPage from './pages/CreateEventPage';
import EditEventPage from './pages/EditEventPage';
import EventDetailPage from './pages/EventDetailPage';
import AnalyticsPage from './pages/AnalyticsPage';
import InvitationPage from './pages/InvitationPage';
import InvitationsPage from './pages/InvitationsPage';
import ProfilePage from './pages/ProfilePage';

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<HomePage />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />

      {/* Permanent invitation page for all users */}
      <Route path="invitations" element={<InvitationsPage />} />
      {/* Public invitation token route */}
      <Route path="invitation/:token" element={<InvitationPage />} />
      {/* Profile page route */}
      <Route path="profile" element={<ProfilePage />} />

      {/* Coming Soon routes */}
      <Route path="features" element={<ComingSoonPage />} />
      <Route path="pricing" element={<ComingSoonPage />} />
      <Route path="blog" element={<ComingSoonPage />} />
      <Route path="about" element={<ComingSoonPage />} />
      <Route path="contact" element={<ComingSoonPage />} />
      <Route path="documentation" element={<ComingSoonPage />} />
      <Route path="help-center" element={<ComingSoonPage />} />
      <Route path="community" element={<ComingSoonPage />} />
      <Route path="webinars" element={<ComingSoonPage />} />
      <Route path="terms" element={<ComingSoonPage />} />
      <Route path="privacy" element={<ComingSoonPage />} />
      <Route path="cookies" element={<ComingSoonPage />} />

      {/* ✅ Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="events/create" element={<CreateEventPage />} />
        <Route path="events/:id/edit" element={<EditEventPage />} />
        <Route path="events/:id" element={<EventDetailPage />} />
        <Route path="analytics/:eventId" element={<AnalyticsPage />} />
      </Route>

      {/* ✅ Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  ),
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);
