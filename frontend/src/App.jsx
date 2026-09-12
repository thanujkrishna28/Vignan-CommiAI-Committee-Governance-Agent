import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeModeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CommitteesListPage from './pages/committees/CommitteesListPage';
import CommitteeDetailPage from './pages/committees/CommitteeDetailPage';
import MeetingsListPage from './pages/meetings/MeetingsListPage';
import MeetingDetailPage from './pages/meetings/MeetingDetailPage';
import MembersListPage from './pages/members/MembersListPage';
import ActionItemsPage from './pages/actions/ActionItemsPage';
import ComplianceHubPage from './pages/compliance/ComplianceHubPage';
import CommiAiAgentPage from './pages/agent/CommiAiAgentPage';
import ReportsPage from './pages/reports/ReportsPage';
import DocumentsPage from './pages/documents/DocumentsPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import MinutesApprovalsPage from './pages/minutes/MinutesApprovalsPage';
import SettingsPage from './pages/settings/SettingsPage';

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return null;
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <ThemeModeProvider>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="committees" element={<CommitteesListPage />} />
                <Route path="committees/:id" element={<CommitteeDetailPage />} />
                <Route path="members" element={<MembersListPage />} />
                <Route path="meetings" element={<MeetingsListPage />} />
                <Route path="meetings/:id" element={<MeetingDetailPage />} />
                <Route path="minutes" element={<MinutesApprovalsPage />} />
                <Route path="actions" element={<ActionItemsPage />} />
                <Route path="compliance" element={<ComplianceHubPage />} />
                <Route path="agent" element={<CommiAiAgentPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="documents" element={<DocumentsPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </ThemeModeProvider>
  );
}

