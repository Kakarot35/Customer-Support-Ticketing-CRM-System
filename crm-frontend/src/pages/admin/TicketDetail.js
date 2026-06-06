import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { StatusBadge, PriorityBadge, Spinner } from '../../components/UI';
import { useToast } from '../../context/ToastContext';
import Sidebar from '../../components/Sidebar';
import { BackIcon, TrashIcon, CheckIcon, LockIcon, GlobeIcon } from '../../components/Icons';

export default function AdminTicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [author, setAuthor] = useState('Agent');
  const [isInternal, setIsInternal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    api.adminGetTicket(id)
      .then(t => { setTicket(t); setStatus(t.status); })
      .catch(err => { toast(err.message, 'error'); navigate('/admin/tickets'); })
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]); // eslint-disable-line

  const handleUpdate = async () => {
    if (!note.trim() && status === ticket.status) {
      toast('No changes to save', 'error'); return;
    }
    setSaving(true);
    try {
      await api.adminUpdateTicket(id, {
        status,
        notes: note.trim() || null,
        author,
        is_internal: isInternal,
      });
      setNote('');
      toast('Ticket updated!', 'success');
      load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete ${id}? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await api.adminDeleteTicket(id);
      toast(`Ticket ${id} deleted`, 'success');
      navigate('/admin/tickets');
    } catch (err) {
      toast(err.message, 'error');
      setDeleting(false);
    }
  };

  if (loading) return <div className="app-shell"><Sidebar /><main className="main-content"><Spinner /></main></div>;
  if (!ticket) return null;

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div className="page-header-left">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h2 className="mono" style={{ margin: 0 }}>{ticket.ticket_id}</h2>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            <p style={{ marginTop: 6, fontWeight: 500, fontSize: '1.05rem', color: 'var(--text)' }}>{ticket.subject}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" onClick={() => navigate('/admin/tickets')}>
              <BackIcon size={16} />
              <span>Back</span>
            </button>
            <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={deleting}>
              {deleting ? (
                <span className="spinner" style={{ width: 12, height: 12 }} />
              ) : (
                <>
                  <TrashIcon size={14} />
                  <span>Delete</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="page-body">
          <div className="detail-grid">
            {/* Left Column: Customer details, description, notes history */}
            <div style={{ display: 'grid', gap: 24 }}>
              
              {/* Ticket description & customer info */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Customer & Ticket Details</span>
                </div>
                <div className="card-body">
                  <div className="form-row" style={{ marginBottom: 20 }}>
                    <div className="detail-field">
                      <div className="detail-label">Customer Name</div>
                      <div className="detail-value" style={{ fontWeight: 600 }}>{ticket.customer_name}</div>
                    </div>
                    <div className="detail-field">
                      <div className="detail-label">Email Address</div>
                      <div className="detail-value" style={{ color: 'var(--text2)' }}>{ticket.customer_email}</div>
                    </div>
                    <div className="detail-field">
                      <div className="detail-label">Submitted On</div>
                      <div className="detail-value" style={{ fontSize: 13.5 }}>{new Date(ticket.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true })}</div>
                    </div>
                    <div className="detail-field">
                      <div className="detail-label">Last Updated</div>
                      <div className="detail-value" style={{ fontSize: 13.5 }}>{new Date(ticket.updated_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true })}</div>
                    </div>
                  </div>
                  
                  <div className="detail-field" style={{ marginBottom: 0 }}>
                    <div className="detail-label">Problem Description</div>
                    <div className="detail-desc">{ticket.description}</div>
                  </div>
                </div>
              </div>

              {/* Notes Timeline */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Notes & Activity ({ticket.notes?.length || 0})</span>
                </div>
                <div className="card-body">
                  {ticket.notes?.length === 0 ? (
                    <div style={{ color: 'var(--text3)', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>
                      No notes or activity logged. Use the panel on the right to post an update.
                    </div>
                  ) : (
                    <div className="notes-list">
                      {ticket.notes.map(n => {
                        const avatarInitials = n.author?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'AG';
                        return (
                          <div key={n.id} className={`note-card ${n.is_internal ? 'internal' : 'public'}`} style={{ display: 'flex', gap: 12 }}>
                            <div className={`user-avatar ${n.is_internal ? 'avatar-admin' : 'avatar-customer'}`} style={{ width: 32, height: 32, fontSize: '0.78rem', marginTop: 2 }}>
                              {avatarInitials}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div className="note-meta" style={{ marginBottom: 4 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <span className="note-author">👤 {n.author}</span>
                                  {n.is_internal ? (
                                    <span className="note-internal-tag" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                      <LockIcon size={10} />
                                      <span>Internal</span>
                                    </span>
                                  ) : (
                                    <span className="badge badge-closed" style={{ padding: '1px 6px', fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                                      <GlobeIcon size={10} />
                                      <span>Public</span>
                                    </span>
                                  )}
                                </div>
                                <span className="note-time">{new Date(n.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true })}</span>
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

            {/* Right Column: Update Form Action Panel */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Update Ticket</span>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-input" value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Agent Name</label>
                  <input className="form-input" placeholder="Your name"
                    value={author} onChange={e => setAuthor(e.target.value)} />
                </div>

                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label">Add Note / Message</label>
                  <textarea className="form-input" rows={4}
                    placeholder="Write an internal note or a reply to the customer..."
                    value={note} onChange={e => setNote(e.target.value)} />
                </div>

                {/* Custom Toggle Switch for Internal / Public */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <button
                    type="button"
                    onClick={() => setIsInternal(v => !v)}
                    style={{
                      width: 40, height: 22, borderRadius: 99,
                      background: isInternal ? 'var(--purple)' : 'var(--border-strong)',
                      position: 'relative', transition: 'background 0.2s',
                      flexShrink: 0, padding: 0
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: 3,
                      left: isInternal ? 21 : 3,
                      width: 16, height: 16,
                      borderRadius: '50%', background: '#fff',
                      transition: 'left 0.2s',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.15)'
                    }} />
                  </button>
                  <span style={{ fontSize: 13, fontWeight: 500, color: isInternal ? 'var(--purple)' : 'var(--text2)' }}>
                    {isInternal ? '🔒 Internal (visible to agents only)' : '🌐 Public (visible to customer)'}
                  </span>
                </div>

                <button className="btn btn-primary btn-full" onClick={handleUpdate} disabled={saving}>
                  {saving ? (
                    <>
                      <span className="spinner" style={{ width: 14, height: 14 }} />
                      <span>Saving Changes…</span>
                    </>
                  ) : (
                    <>
                      <CheckIcon size={16} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
