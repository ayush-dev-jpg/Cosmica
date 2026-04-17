// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Landing         from './pages/Landing';
import Login           from './pages/Login';
import Signup          from './pages/Signup';
import Dashboard       from './pages/Dashboard';
import Chart           from './pages/Chart';
import Admin           from './pages/Admin';
import KnowledgeEditor from './pages/KnowledgeEditor';
import Nakshatra from './pages/Nakshatra';
import NotFound        from './pages/NotFound';
import MoonSign from './pages/MoonSign';
import Compatibility from './pages/Compatibility';
import Panchang from './pages/Panchang';
import TaraBalam from './pages/TaraBalam';


function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  return isLoggedIn ? <Navigate to="/dashboard" replace /> : children;
}

function OpenRoute({ children }) {
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"             element={<Landing />} />
      <Route path="/login"        element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup"       element={<PublicRoute><Signup /></PublicRoute>} />
      <Route path="/chart"        element={<OpenRoute><Chart /></OpenRoute>} />
      <Route path="/dashboard"    element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/chart/:id"    element={<ProtectedRoute><Chart /></ProtectedRoute>} />
      <Route path="/admin"        element={<ProtectedRoute><Admin /></ProtectedRoute>} />
      <Route path="/my-knowledge" element={<ProtectedRoute><KnowledgeEditor /></ProtectedRoute>} />
      <Route path="/nakshatra" element={<OpenRoute><Nakshatra /></OpenRoute>} />
      <Route path="*"             element={<NotFound />} />
      <Route path="/moon-sign" element={<OpenRoute><MoonSign /></OpenRoute>} />
      <Route path="/compatibility" element={<Compatibility/>} />
      <Route path="/panchang" element={<Panchang />} />
      <Route path="/tara-balam" element={<TaraBalam />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}