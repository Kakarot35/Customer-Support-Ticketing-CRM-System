import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { StatusBadge, PriorityBadge, Spinner } from '../../components/UI';
import Header from '../../components/Header';
import { BackIcon, InfoIcon } from '../../components/Icons';

export default function CustomerTicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.customerGetTicket(id)
      .then(setTicket)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spinner />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <div className="container mx-auto px-4 py-8" style={{ maxWidth: 1200, margin: '0 auto', flex: 1 }}>
          <div className="alert alert-error" style={{ marginBottom: 16 }}>
            <InfoIcon size={16} />
            <span>{error}</span>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate('/my-tickets')}>
            <BackIcon size={16} />
            <span>Back</span>
          </button>
        </div>
      </div>
    );
  }

  const publicNotes = ticket.notes?.filter(n => !n.is_internal) || [];

  return (
    <div className="min-h-screen bg-background" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <div className="container mx-auto px-4 py-8" style={{ maxWidth: 1200, margin: '0 auto', flex: 1 }}>
        <div className="page-header" style={{ marginBottom: 24, padding: 0 }}>
          <div className="page-header-left">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h2 className="mono" style={{ margin: 0, fontSize: '1.85rem' }}>{ticket.ticket_id}</h2>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            <p style={{ marginTop: 6, fontWeight: 500, fontSize: '1.05rem', color: 'var(--text)' }}>{ticket.subject}</p>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate('/my-tickets')}>
            <BackIcon size={16} />
            <span>Back</span>
          </button>
        </div>

        <div className="page-body" style={{ padding: 0 }}>
          <div className="detail-grid">
            {/* Left Column: Description & Responses */}
            <div style={{ display: 'grid', gap: 24 }}>
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Description</span>
                </div>
                <div className="card-body" style={{ padding: '1.25rem 1.5rem' }}>
                  <div className="detail-desc" style={{ background: 'transparent', border: 'none', padding: 0 }}>
                    {ticket.description}
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <span className="card-title">Conversation Timeline ({publicNotes.length})</span>
                </div>
                <div className="card-body">
                  {publicNotes.length === 0 ? (
                    <div style={{ color: 'var(--text3)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
                      No responses yet. Our support team will get back to you soon.
                    </div>
                  ) : (
                    <div className="notes-list">
                      {publicNotes.map(n => {
                        const avatarInitials = n.author?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'AG';
                        return (
                          <div key={n.id} className="note-card public" style={{ display: 'flex', gap: 12 }}>
                            <div className="user-avatar avatar-admin" style={{ width: 32, height: 32, fontSize: '0.78rem', marginTop: 2 }}>
                              {avatarInitials}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div className="note-meta" style={{ marginBottom: 4 }}>
                                <span className="note-author">👤 {n.author}</span>
                                <span className="note-time">{new Date(n.created_at).toLocaleString()}</span>
                              </div>
                              <div className="note-text">{n.note_text}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Ticket Meta Card */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Ticket Info</span>
              </div>
              <div className="card-body" style={{ padding: '1.25rem' }}>
                <div className="detail-field">
                  <div className="detail-label">Submitted By</div>
                  <div className="detail-value" style={{ fontWeight: 600 }}>{ticket.customer_name}</div>
                </div>
                <div className="detail-field">
                  <div className="detail-label">Email</div>
                  <div className="detail-value" style={{ fontSize: 13.5, color: 'var(--text2)' }}>{ticket.customer_email}</div>
                </div>
                <div className="detail-field">
                  <div className="detail-label">Created</div>
                  <div className="detail-value" style={{ fontSize: 13 }}>{new Date(ticket.created_at).toLocaleString()}</div>
                </div>
                <div className="detail-field" style={{ marginBottom: 0 }}>
                  <div className="detail-label">Last Updated</div>
                  <div className="detail-value" style={{ fontSize: 13 }}>{new Date(ticket.updated_at).toLocaleString()}</div>
                </div>
              </div>
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
