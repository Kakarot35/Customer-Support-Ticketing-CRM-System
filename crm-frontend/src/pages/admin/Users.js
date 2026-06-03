import React, { useEffect, useState } from 'react';
import { api } from '../../api';
import { Spinner, EmptyState } from '../../components/UI';
import Header from '../../components/Header';
import { SearchIcon, UsersIcon } from '../../components/Icons';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.adminListTickets({})
      .then(tickets => {
        const map = {};
        tickets.forEach(t => {
          if (!map[t.customer_email]) {
            map[t.customer_email] = {
              name: t.customer_name,
              email: t.customer_email,
              tickets: 0,
              open: 0,
              last_seen: t.created_at,
            };
          }
          map[t.customer_email].tickets++;
          if (t.status !== 'Closed') map[t.customer_email].open++;
          if (t.created_at > map[t.customer_email].last_seen) {
            map[t.customer_email].last_seen = t.created_at;
          }
        });
        setUsers(Object.values(map));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      {/* Title block */}
      <div className="container mx-auto px-4 py-8" style={{ maxWidth: 1200, margin: '0 auto', flex: 1 }}>
        <div className="page-header" style={{ marginBottom: 24, padding: 0 }}>
          <div className="page-header-left">
            <h2 style={{ margin: 0, fontSize: '1.85rem' }}>Customers</h2>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text3)' }}>
              {filtered.length} customer{filtered.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        <div className="page-body" style={{ padding: 0 }}>
          <div className="toolbar" style={{ marginBottom: 20 }}>
            <div className="search-box">
              <span className="search-icon"><SearchIcon size={16} /></span>
              <input
                className="search-input"
                placeholder="Search by name or email…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
              <span className="spinner" style={{ width: 24, height: 24 }} />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<UsersIcon size={36} style={{ color: 'var(--text3)' }} />}
              title="No customers yet"
              desc="Customers will appear here once they submit tickets."
            />
          ) : (
            <div className="table-wrap" style={{ background: '#ffffff', boxShadow: 'var(--shadow-sm)' }}>
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Total Tickets</th>
                    <th>Open Tickets</th>
                    <th>Last Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, idx) => {
                    const initials = u.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                    const colors = [
                      { bg: 'var(--primary-soft)', text: 'var(--primary-dark)' },
                      { bg: 'var(--purple-bg)', text: 'var(--purple)' },
                      { bg: 'var(--green-bg)', text: 'var(--green)' },
                    ];
                    const chosenColor = colors[idx % colors.length];

                    return (
                      <tr key={u.email}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                background: chosenColor.bg,
                                color: chosenColor.text,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 12,
                                fontWeight: 700,
                                flexShrink: 0,
                              }}
                            >
                              {initials}
                            </div>
                            <span style={{ fontWeight: 600 }}>{u.name}</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text2)' }}>{u.email}</td>
                        <td>
                          <span className="mono" style={{ fontWeight: 600 }}>
                            {u.tickets}
                          </span>
                        </td>
                        <td>
                          {u.open > 0 ? (
                            <span className="badge badge-open">{u.open} open</span>
                          ) : (
                            <span className="badge badge-closed">All closed</span>
                          )}
                        </td>
                        <td style={{ color: 'var(--text2)', fontSize: 12.5 }}>
                          {new Date(u.last_seen).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <footer className="landing-footer" style={{ marginTop: 'auto' }}>
        <span>© 2026 Datastraw Technologies · SupportCRM v2.0</span>
      </footer>
    </div>
  );
}
