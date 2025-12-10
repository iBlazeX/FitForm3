/**
 * FitForm Web Application
 * Main App Component with Routing
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Workout from './pages/Workout';
import History from './pages/History';
import Profile from './pages/Profile';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

// Navigation Component
const Navigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';
  
  if (!user) return null;
  
  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">💪 FitForm</Link>
        <div className="navbar-nav">
          <Link to="/" className={isActive('/')}>Dashboard</Link>
          <Link to="/workout" className={isActive('/workout')}>Workout</Link>
          <Link to="/history" className={isActive('/history')}>History</Link>
          <Link to="/profile" className={isActive('/profile')}>Profile</Link>
          <button onClick={logout} className="nav-button">Logout</button>
        </div>
      </div>
    </nav>
  );
};

// App Layout
const AppLayout = ({ children }) => {
  return (
    <>
      <Navigation />
      <main style={{ padding: '20px 0' }}>
        {children}
      </main>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/workout" element={
              <ProtectedRoute>
                <Workout />
              </ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
          </Routes>
        </AppLayout>
      </Router>
    </AuthProvider>
  );
}

export default App;
