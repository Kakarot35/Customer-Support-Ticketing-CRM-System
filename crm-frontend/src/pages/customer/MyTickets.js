import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { StatusBadge, PriorityBadge, Spinner, EmptyState } from '../../components/UI';
import Header from '../../components/Header';
import { TicketIcon, PlusIcon } from '../../components/Icons';

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const load = useCallback(() => {
    setLoading(true);
    api.customerListTickets({ status })
      .then(setTickets)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [status]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="min-h-screen bg-background" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <div className="container mx-auto px-4 py-8" style={{ maxWidth: 1200, margin: '0 auto', flex: 1 }}>
        <div className="page-header" style={{ marginBottom: 24, padding: 0 }}>
          <div className="page-header-left">
            <h2 style={{ margin: 0, fontSize: '1.85rem' }}>My Tickets</h2>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text3)' }}>
              {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/my-tickets/new')}>
            <PlusIcon size={16} />
            <span>New Ticket</span>
          </button>
        </div>

        <div className="page-body" style={{ padding: 0 }}>
          <div className="toolbar" style={{ marginBottom: 20 }}>
            <select className="form-input" style={{ width: 180 }} value={status} onChange={e => setStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
              <span className="spinner" style={{ width: 24, height: 24 }} />
            </div>
          ) : tickets.length === 0 ? (
            <EmptyState
              icon={<TicketIcon size={36} style={{ color: 'var(--text3)' }} />}
              title="No tickets yet"
              desc="Submit a support request and our team will get back to you."
              action={
                <button className="btn btn-primary" onClick={() => navigate('/my-tickets/new')}>
                  <PlusIcon size={16} />
                  <span>Create First Ticket</span>
                </button>
              }
            />
          ) : (
            <div className="table-wrap" style={{ background: '#ffffff', boxShadow: 'var(--shadow-sm)' }}>
              <table>
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Subject</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(t => (
                    <tr key={t.ticket_id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/my-tickets/${t.ticket_id}`)}>
                      <td><span className="tid">{t.ticket_id}</span></td>
                      <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{t.subject}</td>
                      <td><PriorityBadge priority={t.priority} /></td>
                      <td><StatusBadge status={t.status} /></td>
                      <td style={{ color: 'var(--text2)', fontSize: 12.5 }}>{new Date(t.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
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
