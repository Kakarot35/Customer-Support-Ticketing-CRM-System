import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { LockIcon, InfoIcon, ArrowRightIcon } from '../../components/Icons';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields'); return; }
    setLoading(true); setError('');
    try {
      const role = await login(form.email, form.password);
      toast(`Welcome back!`, 'success');
      navigate(role === 'admin' ? '/admin/dashboard' : '/my-tickets', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email, password) => setForm({ email, password });

  return (
    <div className="auth-shell">
      <div className="auth-card">

        {/* Brand */}
        <div className="auth-logo">
          <div>
            <h1>Support<em>CRM</em></h1>
            <span>Datastraw <strong>Technologies</strong></span>
          </div>
        </div>

        {/* Heading */}
        <h2 className="auth-title">
          Welcome <em>back</em>
        </h2>
        <p className="auth-subtitle">
          Sign in to your <strong>account</strong> to continue
        </p>

        {/* Demo accounts */}
        <div className="demo-box">
          <div className="demo-box-title" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <LockIcon size={14} />
            <span>Demo Accounts — <em>click to fill</em></span>
          </div>
          <div
            className="demo-item"
            style={{ cursor: 'pointer' }}
            onClick={() => fillDemo('admin@datastraw.in', 'Admin@123')}
          >
            <span className="label"><strong>admin@datastraw.in</strong></span>
            <span className="role-badge role-admin">Admin</span>
          </div>
          <div
            className="demo-item"
            style={{ cursor: 'pointer', marginTop: 8 }}
            onClick={() => fillDemo('demo@customer.com', 'Demo@123')}
          >
            <span className="label"><strong>demo@customer.com</strong></span>
            <span className="role-badge role-customer">Customer</span>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <InfoIcon size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => set('password', e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="spinner" style={{ width: 16, height: 16 }} />
                Signing in…
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <strong>Sign In</strong>
                <ArrowRightIcon size={16} />
              </span>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register"><strong>Create one</strong></Link>
        </div>
      </div>
    </div>
  );
}
