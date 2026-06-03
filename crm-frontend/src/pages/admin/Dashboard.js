import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/UI';
import Header from '../../components/Header';
import { SearchIcon, InfoIcon, LockIcon, GlobeIcon } from '../../components/Icons';

export default function AdminDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Filters State
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Update Form State
  const [updateForm, setUpdateForm] = useState({ status: '', notes: '', is_internal: false });

  // Fetch Tickets List
  const fetchList = () => {
    setLoadingList(true);
    api.adminListTickets({ status: statusFilter || undefined, search: searchQuery || undefined })
      .then(setTickets)
      .catch(err => toast(err.message, 'error'))
      .finally(() => setLoadingList(false));
  };

  // Fetch tickets when filters change
  useEffect(() => {
    fetchList();
  }, [statusFilter, searchQuery]);

  // Fetch selected ticket details when ID changes
  useEffect(() => {
    if (id) {
      api.adminGetTicket(id)
        .then(res => {
          setSelectedTicket(res);
          setUpdateForm({ status: res.status, notes: '', is_internal: false });
        })
        .catch(err => {
          toast(err.message, 'error');
          navigate('/admin/dashboard', { replace: true });
        });
    } else {
      setSelectedTicket(null);
    }
  }, [id]);

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;
    if (!updateForm.status && !updateForm.notes.trim()) {
      toast('Please choose a status or write a note.', 'error');
      return;
    }

    setUpdating(true);
    try {
      await api.adminUpdateTicket(selectedTicket.ticket_id, {
        status: updateForm.status || undefined,
        notes: updateForm.notes.trim() || undefined,
        is_internal: updateForm.is_internal,
        author: 'Agent'
      });
      toast('Ticket updated successfully', 'success');
      // Refresh details and list
      if (id) {
        api.adminGetTicket(id)
          .then(res => {
            setSelectedTicket(res);
            setUpdateForm({ status: res.status, notes: '', is_internal: false });
          })
          .catch(err => toast(err.message, 'error'));
      }
      fetchList();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      {/* Hero Banner */}
      <div
        className="relative w-full h-64 bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: 'url(https://d2xsxph8kpxj0f.cloudfront.net/310519663718734612/EbLdjUP9Zg7JMVNmbPp72w/hero-admin-dashboard-bHSibszX9XcLso4dVDPyTB.webp)',
          position: 'relative',
        }}
      >
        <div className="absolute inset-0" style={{ background: 'rgba(0, 0, 0, 0.25)', position: 'absolute' }} />
        <div className="relative z-10 text-center" style={{ zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, justifyContent: 'center' }}>
            <span>Admin Dashboard</span>
            <span style={{ color: 'var(--primary)', fontWeight: 500, fontSize: '1.6rem' }}>· Datastraw</span>
          </span>
          <p style={{ color: '#334155', fontSize: '1.1rem', margin: 0, fontWeight: 600 }}>
            Manage support tickets and customer issues
          </p>
        </div>
      </div>

      {/* Grid Layout Container */}
      <div className="container mx-auto px-4 py-8" style={{ maxWidth: 1200, margin: '0 auto', flex: 1 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: 24,
            alignItems: 'start',
          }}
        >
          {/* Left Column: Filters (Col Span 4) */}
          <div style={{ gridColumn: 'span 4' }}>
            <div className="card" style={{ padding: 20 }}>
              <div className="card-header" style={{ padding: '0 0 16px 0', borderBottom: '1px solid var(--border)' }}>
                <span className="card-title" style={{ fontSize: '1.1rem' }}>Filters</span>
              </div>
              <div className="card-body" style={{ padding: '16px 0 0 0', display: 'grid', gap: 16 }}>
                <div>
                  <label className="form-label" style={{ marginBottom: 6 }}>Status</label>
                  <select
                    className="form-input"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="">All Statuses</option>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ marginBottom: 6 }}>Search</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="form-input"
                      placeholder="Search by subject, email..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      style={{ width: '100%', paddingLeft: 34 }}
                    />
                    <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }}>
                      <SearchIcon size={16} />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => { setStatusFilter(''); setSearchQuery(''); }}
                  className="btn btn-secondary btn-full"
                  style={{ marginTop: 8 }}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Tickets & Details (Col Span 8) */}
          <div style={{ gridColumn: 'span 8', display: 'grid', gap: 24 }}>
            {/* Tickets list card */}
            <div className="card" style={{ padding: 24 }}>
              <div className="card-header" style={{ padding: '0 0 16px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="card-title" style={{ fontSize: '1.15rem' }}>Tickets Queue</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text3)' }}>
                    {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} found
                  </p>
                </div>
              </div>
              <div className="card-body" style={{ padding: '16px 0 0 0' }}>
                {loadingList ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
                    <span className="spinner" style={{ width: 24, height: 24 }} />
                  </div>
                ) : tickets.length === 0 ? (
                  <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>No tickets found</div>
                ) : (
                  <div style={{ display: 'grid', gap: 12 }}>
                    {tickets.map(t => (
                      <div
                        key={t.ticket_id}
                        onClick={() => navigate(`/admin/tickets/${t.ticket_id}`)}
                        className="card"
                        style={{
                          padding: 16,
                          cursor: 'pointer',
                          borderColor: selectedTicket?.ticket_id === t.ticket_id ? 'var(--primary)' : 'var(--border)',
                          boxShadow: selectedTicket?.ticket_id === t.ticket_id ? '0 0 0 2px var(--primary-soft)' : 'var(--shadow-sm)',
                          transition: 'all 0.2s',
                          background: selectedTicket?.ticket_id === t.ticket_id ? 'var(--surface-warm)' : 'var(--surface)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                          <div>
                            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)' }}>
                              {t.subject}
                            </h4>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>
                              ID: <strong className="mono">{t.ticket_id}</strong>
                            </span>
                          </div>
                          <StatusBadge status={t.status} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.85rem', color: 'var(--text2)', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                          <div>
                            <strong>Customer:</strong> {t.customer_name}
                          </div>
                          <div>
                            <strong>Email:</strong> {t.customer_email}
                          </div>
                          <div>
                            <strong>Created:</strong> {new Date(t.created_at).toLocaleDateString()}
                          </div>
                          <div>
                            <strong>Updated:</strong> {new Date(t.updated_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Selected Ticket inline Details Editor */}
            {selectedTicket && (
              <div className="card" style={{ padding: 24, animation: 'fadeIn 0.2s ease-out' }}>
                <div
                  className="card-header"
                  style={{
                    padding: '0 0 16px 0',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 12,
                  }}
                >
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.3rem' }}>{selectedTicket.subject}</h3>
                    <span className="mono" style={{ fontSize: '0.85rem', color: 'var(--text3)' }}>
                      ID: {selectedTicket.ticket_id}
                    </span>
                  </div>
                  <StatusBadge status={selectedTicket.status} />
                </div>
                <div className="card-body" style={{ padding: '16px 0 0 0' }}>
                  
                  {/* Detailed Meta */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20, fontSize: '0.88rem' }}>
                    <div>
                      <div style={{ color: 'var(--text3)', fontWeight: 600 }}>Customer Name</div>
                      <div style={{ fontWeight: 500 }}>{selectedTicket.customer_name}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text3)', fontWeight: 600 }}>Email Address</div>
                      <div style={{ fontWeight: 500 }}>{selectedTicket.customer_email}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text3)', fontWeight: 600 }}>Created Date</div>
                      <div style={{ fontWeight: 500 }}>{new Date(selectedTicket.created_at).toLocaleString()}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text3)', fontWeight: 600 }}>Last Updated</div>
                      <div style={{ fontWeight: 500 }}>{new Date(selectedTicket.updated_at).toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Description Box */}
                  <div style={{ background: 'var(--surface-soft)', padding: 16, borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: 24 }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '0.92rem', fontWeight: 700 }}>Description</h4>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text)', whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>
                      {selectedTicket.description}
                    </p>
                  </div>

                  {/* Notes Timeline */}
                  {selectedTicket.notes && selectedTicket.notes.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                      <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: 700 }}>Notes Timeline</h4>
                      <div style={{ display: 'grid', gap: 12 }}>
                        {selectedTicket.notes.map(note => (
                          <div
                            key={note.id}
                            style={{
                              background: note.is_internal ? 'var(--surface-warm)' : 'var(--background)',
                              border: '1px solid var(--border)',
                              borderColor: note.is_internal ? 'rgba(217,119,6,0.2)' : 'var(--border)',
                              padding: 12,
                              borderRadius: 'var(--radius)',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text3)', marginBottom: 6 }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                👤 {note.author}
                                {note.is_internal ? (
                                  <span style={{ color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: 2, background: 'var(--amber-bg)', padding: '1px 5px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>
                                    <LockIcon size={9} />
                                    Internal
                                  </span>
                                ) : (
                                  <span style={{ color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 2, background: 'var(--green-bg)', padding: '1px 5px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>
                                    <GlobeIcon size={9} />
                                    Public
                                  </span>
                                )}
                              </span>
                              <span>{new Date(note.created_at).toLocaleString()}</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.5 }}>
                              {note.note_text}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Note Update Form */}
                  <form onSubmit={handleUpdateSubmit} style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '0.95rem', fontWeight: 700 }}>Update Ticket</h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                      <div>
                        <label className="form-label" style={{ marginBottom: 6 }}>Status</label>
                        <select
                          className="form-input"
                          value={updateForm.status}
                          onChange={e => setUpdateForm(f => ({ ...f, status: e.target.value }))}
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <span className="form-label" style={{ marginBottom: 8 }}>Visibility</span>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.88rem', userSelect: 'none' }}>
                          <input
                            type="checkbox"
                            checked={updateForm.is_internal}
                            onChange={e => setUpdateForm(f => ({ ...f, is_internal: e.target.checked }))}
                            style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--primary)' }}
                          />
                          <span>Flag as Internal Note (Staff only)</span>
                        </label>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 20 }}>
                      <label className="form-label">Add Note</label>
                      <textarea
                        className="form-input"
                        placeholder="Type updates or feedback for this ticket..."
                        rows={4}
                        value={updateForm.notes}
                        onChange={e => setUpdateForm(f => ({ ...f, notes: e.target.value }))}
                      />
                    </div>

                    <button type="submit" className="btn btn-primary btn-full" disabled={updating}>
                      {updating ? (
                        <>
                          <span className="spinner" style={{ width: 14, height: 14 }} />
                          <span>Updating Ticket...</span>
                        </>
                      ) : (
                        <span>Save Update</span>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="landing-footer" style={{ marginTop: 'auto' }}>
        <span>© 2026 Datastraw Technologies · SupportCRM v2.0</span>
      </footer>
    </div>
  );
}
