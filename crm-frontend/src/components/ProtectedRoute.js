import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Shows a spinner while auth is being checked
function Splash() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div className="loading-wrap"><div className="spinner" /><span>Loading…</span></div>
    </div>
  );
}

export function RequireAuth({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <Splash />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/my-tickets'} replace />;
  }
  return children;
}

export function RedirectIfAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Splash />;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/my-tickets'} replace />;
  return children;
}
