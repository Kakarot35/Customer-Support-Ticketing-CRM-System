import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LogoutIcon, TicketIcon, UsersIcon, DashboardIcon } from './Icons';

export default function Header() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast('Logged out successfully', 'success');
    navigate('/login');
  };

  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

  return (
    <header
      style={{
        background: '#ffffff',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        className="container"
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px',
          height: 64,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Left side: Logo & Branding */}
        <Link
          to={isAdmin ? '/admin/dashboard' : '/my-tickets'}
          style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text)', textDecoration: 'none' }}
        >
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>SupportCRM</span>
            <span style={{ color: 'var(--text3)', fontWeight: 500, fontSize: '1rem' }}>· Datastraw</span>
          </span>
        </Link>

        {/* Center: Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isAdmin ? (
            <>
              <Link
                to="/admin/dashboard"
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: location.pathname.startsWith('/admin/dashboard') || location.pathname.startsWith('/admin/tickets') ? 'var(--primary-dark)' : 'var(--text2)',
                  background: location.pathname.startsWith('/admin/dashboard') || location.pathname.startsWith('/admin/tickets') ? 'var(--primary-soft)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <DashboardIcon size={16} />
                <span>Tickets Board</span>
              </Link>
              <Link
                to="/admin/users"
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: location.pathname === '/admin/users' ? 'var(--primary-dark)' : 'var(--text2)',
                  background: location.pathname === '/admin/users' ? 'var(--primary-soft)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <UsersIcon size={16} />
                <span>Customers</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/my-tickets"
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: location.pathname === '/my-tickets' ? 'var(--primary-dark)' : 'var(--text2)',
                  background: location.pathname === '/my-tickets' ? 'var(--primary-soft)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <TicketIcon size={16} />
                <span>My Tickets</span>
              </Link>
              <Link
                to="/my-tickets/new"
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: location.pathname === '/my-tickets/new' ? 'var(--primary-dark)' : 'var(--text2)',
                  background: location.pathname === '/my-tickets/new' ? 'var(--primary-soft)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 700 }}>+</span>
                <span>New Ticket</span>
              </Link>
            </>
          )}
        </nav>

        {/* Right side: User Profile & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'var(--primary-dark)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              {initials}
            </div>
            <div style={{ display: 'none', flexDirection: 'column' }} className="md-flex">
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>{user.name}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text3)', textTransform: 'capitalize' }}>{user.role}</span>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: 'var(--text3)',
              fontSize: '0.88rem',
              fontWeight: 500,
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'var(--red-bg)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text3)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <LogoutIcon size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
