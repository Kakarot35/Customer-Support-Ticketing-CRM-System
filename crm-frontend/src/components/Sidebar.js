import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { DashboardIcon, TicketIcon, UsersIcon, LogoutIcon, PlusIcon } from './Icons';

const ADMIN_NAV = [
  { to: '/admin/dashboard', icon: <DashboardIcon />, label: 'Dashboard' },
  { to: '/admin/tickets', icon: <TicketIcon />, label: 'All Tickets' },
  { to: '/admin/users',   icon: <UsersIcon />, label: 'Users' },
];

const CUSTOMER_NAV = [
  { to: '/my-tickets',     icon: <TicketIcon />, label: 'My Tickets' },
  { to: '/my-tickets/new', icon: <PlusIcon />, label: 'New Ticket' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const navItems = isAdmin ? ADMIN_NAV : CUSTOMER_NAV;

  const handleLogout = () => {
    logout();
    toast('Logged out successfully', 'info');
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <div className="brand-icon">🎧</div>
          <div className="brand-text">
            <h2>Support<em>CRM</em></h2>
            <span>Datastraw</span>
          </div>
        </div>

        <div className="user-pill">
          <div className={`user-avatar ${isAdmin ? 'avatar-admin' : 'avatar-customer'}`}>
            {initials}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">{isAdmin ? 'Admin Panel' : 'Customer Portal'}</div>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin/dashboard' || item.to === '/my-tickets'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button className="logout-btn" onClick={handleLogout}>
          <span className="nav-icon"><LogoutIcon /></span> Logout
        </button>
      </div>
    </aside>
  );
}
