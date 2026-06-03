import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UsersIcon, DashboardIcon, ArrowRightIcon } from '../../components/Icons';

export default function Home() {
  const { user, loading } = useAuth();

  // If already logged in, redirect to respective dashboard
  if (loading) return null;
  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/my-tickets'} replace />;
  }

  return (
    <div className="min-h-screen bg-background" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Hero Section */}
      <div
        className="relative w-full flex items-center justify-center"
        style={{
          height: '420px',
          backgroundImage: 'url(https://d2xsxph8kpxj0f.cloudfront.net/310519663718734612/EbLdjUP9Zg7JMVNmbPp72w/hero-customer-portal-CZGBiE9oiNoEWKqYGRS23G.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        <div className="absolute inset-0" style={{ background: 'rgba(0, 0, 0, 0.35)', position: 'absolute' }} />
        <div className="relative z-10 text-center px-4" style={{ zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span className="hero-main-title" style={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 12 }}>
            <span>SupportCRM</span>
            <span className="hero-sub-brand" style={{ color: 'var(--primary)', fontWeight: 500 }}>· Datastraw</span>
          </span>
          <p style={{ color: '#334155', fontSize: '1.25rem', margin: 0, fontWeight: 600, maxWidth: 660 }}>
            Streamlined support ticket management for customers and administrators
          </p>
        </div>
      </div>

      {/* Portal Cards Selection */}
      <div className="container max-w-4xl mx-auto px-4 py-16" style={{ maxWidth: 960, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 32,
            marginBottom: 64,
          }}
        >
          {/* Customer Portal Card */}
          <div
            className="card"
            style={{
              padding: 32,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.2s',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{ padding: 12, background: 'rgba(217, 119, 6, 0.1)', color: 'var(--primary)', borderRadius: 'var(--radius)' }}>
                  <UsersIcon size={24} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 700 }}>Customer Portal</h3>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text3)', margin: '0 0 20px 0' }}>
                Submit and track your support tickets
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px 0', display: 'grid', gap: 12 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', color: 'var(--text)' }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>✓</span>
                  <span>Create new support tickets</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', color: 'var(--text)' }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>✓</span>
                  <span>Look up ticket status</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', color: 'var(--text)' }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>✓</span>
                  <span>View support notes</span>
                </li>
              </ul>
            </div>
            <Link to="/my-tickets" className="btn btn-primary btn-full" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
              <span>Go to Customer Portal</span>
              <ArrowRightIcon size={16} />
            </Link>
          </div>

          {/* Admin Dashboard Card */}
          <div
            className="card"
            style={{
              padding: 32,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.2s',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{ padding: 12, background: 'rgba(217, 119, 6, 0.1)', color: 'var(--primary)', borderRadius: 'var(--radius)' }}>
                  <DashboardIcon size={24} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 700 }}>Admin Dashboard</h3>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text3)', margin: '0 0 20px 0' }}>
                Manage support tickets and customer issues
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px 0', display: 'grid', gap: 12 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', color: 'var(--text)' }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>✓</span>
                  <span>View all tickets</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', color: 'var(--text)' }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>✓</span>
                  <span>Update ticket status</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', color: 'var(--text)' }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>✓</span>
                  <span>Add support notes</span>
                </li>
              </ul>
            </div>
            <Link to="/admin/dashboard" className="btn btn-primary btn-full" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
              <span>Go to Admin Dashboard</span>
              <ArrowRightIcon size={16} />
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 48 }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.1rem', marginBottom: 40 }}>Features</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            <div className="card" style={{ padding: 24 }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 700 }}>Easy Ticket Creation</h4>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text2)', lineHeight: 1.55 }}>
                Customers can quickly submit support tickets with detailed descriptions and receive instant ticket IDs.
              </p>
            </div>
            <div className="card" style={{ padding: 24 }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 700 }}>Real-time Status Tracking</h4>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text2)', lineHeight: 1.55 }}>
                Track ticket status from Open to In Progress to Closed, with transparent communication.
              </p>
            </div>
            <div className="card" style={{ padding: 24 }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 700 }}>Efficient Management</h4>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text2)', lineHeight: 1.55 }}>
                Admins can filter, search, and manage tickets with a clean, intuitive dashboard interface.
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="landing-footer" style={{ marginTop: 'auto' }}>
        <span>© 2026 Datastraw Technologies · SupportCRM v2.0</span>
      </footer>
    </div>
  );
}
