import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { LandingPage } from '@/pages/LandingPage';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { CreateTransformation } from '@/pages/CreateTransformation';
import { TransformationDetails } from '@/pages/TransformationDetails';
import { History } from '@/pages/History';
import { Settings } from '@/pages/Settings';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Route */}
          <Route path="/" element={<LandingPage />} />

          {/* Authentication Routes */}
          <Route path="/login" element={<Login initialMode="signin" />} />
          <Route path="/signup" element={<Login initialMode="signup" />} />

          {/* Protected Application Routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create" element={<CreateTransformation />} />
            <Route path="/history" element={<History />} />
            <Route path="/transformation/:id" element={<TransformationDetails />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Catch-all fallback to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
