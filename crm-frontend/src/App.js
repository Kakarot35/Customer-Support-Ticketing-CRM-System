import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { RedirectIfAuth, RequireAuth } from './components/ProtectedRoute';

import Home from './pages/public/Home';
import CustomerPortal from './pages/public/CustomerPortal';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import MyTickets from './pages/customer/MyTickets';
import NewTicket from './pages/customer/NewTicket';
import CustomerTicketDetail from './pages/customer/TicketDetail';

import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/customer" element={<CustomerPortal />} />
            <Route path="/login" element={<RedirectIfAuth><Login /></RedirectIfAuth>} />
            <Route path="/register" element={<RedirectIfAuth><Register /></RedirectIfAuth>} />

            {/* Customer Private Routes */}
            <Route path="/my-tickets" element={<RequireAuth role="customer"><MyTickets /></RequireAuth>} />
            <Route path="/my-tickets/new" element={<RequireAuth role="customer"><NewTicket /></RequireAuth>} />
            <Route path="/my-tickets/:id" element={<RequireAuth role="customer"><CustomerTicketDetail /></RequireAuth>} />

            {/* Admin Private Routes */}
            <Route path="/admin/dashboard" element={<RequireAuth role="admin"><AdminDashboard /></RequireAuth>} />
            <Route path="/admin/tickets/:id" element={<RequireAuth role="admin"><AdminDashboard /></RequireAuth>} />
            <Route path="/admin/tickets" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/users" element={<RequireAuth role="admin"><AdminUsers /></RequireAuth>} />

            {/* Fallbacks */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
