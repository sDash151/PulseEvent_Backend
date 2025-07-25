// src/router.jsx
import React from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  Navigate,
} from 'react-router-dom';

import ProtectedRoute from './components/ui/ProtectedRoute';
import HostOnlyRoute from './components/ui/HostOnlyRoute';
import EventHostRoute from './components/ui/EventHostRoute';
import Layout from './components/layout/Layout';

import ComingSoonPage from './pages/ComingSoonPage';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EmailVerifiedPage from './pages/email-verified';
import DashboardPage from './pages/DashboardPage';
import CreateEventPage from './pages/CreateEventPage';
import EditEventPage from './pages/EditEventPage';
import EventDetailPage from './pages/EventDetailPage';
import SubEventDetailPage from './pages/SubEventDetailPage';
import SubEventDetailsPage from './pages/SubEventDetailsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import InvitationPage from './pages/InvitationPage';
import InvitationsPage from './pages/InvitationsPage';
import ProfilePage from './pages/ProfilePage';
import DynamicRegistrationForm from './pages/DynamicRegistrationForm.jsx';
import HostReviewRegistrationsPage from './pages/HostReviewRegistrationsPage';
import HelpCenterPage from './pages/HelpCenterPage';
import FeaturesPage from './pages/FeaturesPage';
import CheckEmailPage from './pages/check-email';
import EditSubEventPage from './pages/EditSubEventPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import MyRegistrationsPage from './pages/MyRegistrationsPage';

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<HomePage />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route path="check-email" element={<CheckEmailPage />} />
      <Route path="email-verified" element={<EmailVerifiedPage />} />
      <Route path="forgot-password" element={<ForgotPasswordPage />} />
      <Route path="reset-password" element={<ResetPasswordPage />} />

      {/* Permanent invitation page for all users */}
      <Route path="invitations" element={<InvitationsPage />} />
      {/* Public invitation token route */}
      <Route path="invitation/:token" element={<InvitationPage />} />
      {/* Profile page route */}
      <Route path="profile" element={<ProfilePage />} />

      {/* Coming Soon routes */}
      <Route path="features" element={<FeaturesPage />} />
      <Route path="pricing" element={<ComingSoonPage />} />
      <Route path="blog" element={<ComingSoonPage />} />
      <Route path="about" element={<ComingSoonPage />} />
      <Route path="contact" element={<ComingSoonPage />} />
      <Route path="documentation" element={<ComingSoonPage />} />
      <Route path="help-center" element={<HelpCenterPage />} />
      <Route path="community" element={<ComingSoonPage />} />
      <Route path="webinars" element={<ComingSoonPage />} />
      <Route path="terms" element={<ComingSoonPage />} />
      <Route path="privacy" element={<ComingSoonPage />} />
      <Route path="cookies" element={<ComingSoonPage />} />

      {/* ✅ Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="my-registrations" element={<MyRegistrationsPage />} />
        <Route path="events/create" element={<CreateEventPage />} />
        <Route path="events/:parentId/sub/:subId/register" element={<DynamicRegistrationForm />} />
        <Route path="events/:parentId/sub/:subId/details" element={<SubEventDetailsPage />} />
        <Route path="events/:id" element={<EventDetailPage />} />
        <Route path="sub-events/:id" element={<SubEventDetailPage />} />
        <Route path="events/:parentId/sub/:subId" element={<SubEventDetailPage />} />
      </Route>

      {/* 🔐 Host-Only Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<HostOnlyRoute />}>
          <Route path="analytics/:eventId" element={<AnalyticsPage />} />
        </Route>
      </Route>

      {/* 🔐 Event Host-Only Routes (specific event ownership) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<EventHostRoute />}>
          <Route path="events/:id/edit" element={<EditEventPage />} />
          <Route path="events/:parentId/sub/:subId/edit" element={<EditSubEventPage />} />
          <Route path="events/:parentId/sub/:subId/registrations/review" element={<HostReviewRegistrationsPage />} />
        </Route>
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
