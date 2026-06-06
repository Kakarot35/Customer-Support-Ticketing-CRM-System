import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/UI';
import { SendIcon, SearchIcon, ArrowRightIcon, BackIcon, LockIcon, InfoIcon } from '../../components/Icons';

export default function CustomerPortal() {
  const [activeTab, setActiveTab] = useState('create');
  const [createdTicketId, setCreatedTicketId] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  // Create Form State
  const [createForm, setCreateForm] = useState({ customer_name: '', customer_email: '', subject: '', description: '' });
  const [createErrors, setCreateErrors] = useState({});
  const [creating, setCreating] = useState(false);

  // Lookup Form State
  const [lookupForm, setLookupForm] = useState({ ticket_id: '', customer_email: '' });
  const [lookupErrors, setLookupErrors] = useState({});
  const [searching, setSearching] = useState(false);
  const [lookupResult, setLookupResult] = useState(null);

  // Change Create Form fields
  const setCreateField = (k, v) => {
    setCreateForm(f => ({ ...f, [k]: v }));
    setCreateErrors(e => ({ ...e, [k]: '' }));
  };

  // Change Lookup Form fields
  const setLookupField = (k, v) => {
    setLookupForm(f => ({ ...f, [k]: v }));
    setLookupErrors(e => ({ ...e, [k]: '' }));
  };

  const validateCreate = () => {
    const e = {};
    if (!createForm.customer_name.trim()) e.customer_name = 'Name is required';
    if (!createForm.customer_email.trim()) e.customer_email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(createForm.customer_email)) e.customer_email = 'Invalid email address';
    if (!createForm.subject.trim()) e.subject = 'Subject is required';
    if (!createForm.description.trim()) e.description = 'Description is required';
    return e;
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const errs = validateCreate();
    if (Object.keys(errs).length) { setCreateErrors(errs); return; }
    setCreating(true);
    try {
      const res = await api.publicCreateTicket(createForm);
      setCreatedTicketId(res.ticket_id);
      setCreateForm({ customer_name: '', customer_email: '', subject: '', description: '' });
      toast('Ticket created successfully!', 'success');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setCreating(false);
    }
  };

  const validateLookup = () => {
    const e = {};
    if (!lookupForm.ticket_id.trim()) e.ticket_id = 'Ticket ID is required';
    if (!lookupForm.customer_email.trim()) e.customer_email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(lookupForm.customer_email)) e.customer_email = 'Invalid email address';
    return e;
  };

  const handleLookupSubmit = async (e) => {
    e.preventDefault();
    const errs = validateLookup();
    if (Object.keys(errs).length) { setLookupErrors(errs); return; }
    setSearching(true);
    setLookupResult(null);
    try {
      const res = await api.publicLookupTicket(lookupForm);
      setLookupResult(res);
      toast('Ticket found!', 'success');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-background" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Hero Header Banner */}
      <div
        className="relative w-full h-64 bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: 'url(https://d2xsxph8kpxj0f.cloudfront.net/310519663718734612/EbLdjUP9Zg7JMVNmbPp72w/hero-customer-portal-CZGBiE9oiNoEWKqYGRS23G.webp)',
          position: 'relative',
        }}
      >
        <div className="absolute inset-0" style={{ background: 'rgba(0, 0, 0, 0.25)', position: 'absolute' }} />
        
        {/* Home Back Navigation Button */}
        <button
          onClick={() => navigate('/')}
          className="btn btn-secondary btn-sm"
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            background: 'rgba(255,255,255,0.85)',
            border: 'none',
            color: 'var(--text)',
            zIndex: 20,
            backdropFilter: 'blur(4px)'
          }}
        >
          <BackIcon size={14} />
          <span>Home</span>
        </button>

        <div className="relative z-10 text-center" style={{ zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span className="hero-main-title" style={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, justifyContent: 'center' }}>
            <span>Support Center</span>
            <span className="hero-sub-brand" style={{ color: 'var(--primary)', fontWeight: 500 }}>· Datastraw</span>
          </span>
          <p style={{ color: '#334155', fontSize: '1.1rem', margin: 0, fontWeight: 600 }}>Submit and track your support tickets</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container max-w-2xl mx-auto px-4 py-12" style={{ maxWidth: 660, margin: '0 auto', flex: 1 }}>
        
        {/* Custom Tabs Bar */}
        <div
          className="portal-tabs-list"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'var(--border)',
            padding: 4,
            borderRadius: 'var(--radius)',
            marginBottom: 28,
          }}
        >
          <button
            className={`portal-tabs-trigger ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => { setActiveTab('create'); setCreatedTicketId(null); }}
            style={{
              padding: '10px 16px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
              fontSize: '0.92rem',
              color: activeTab === 'create' ? 'var(--text)' : 'var(--text3)',
              background: activeTab === 'create' ? 'var(--surface)' : 'transparent',
              boxShadow: activeTab === 'create' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            Create Ticket
          </button>
          <button
            className={`portal-tabs-trigger ${activeTab === 'lookup' ? 'active' : ''}`}
            onClick={() => { setActiveTab('lookup'); setLookupResult(null); }}
            style={{
              padding: '10px 16px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
              fontSize: '0.92rem',
              color: activeTab === 'lookup' ? 'var(--text)' : 'var(--text3)',
              background: activeTab === 'lookup' ? 'var(--surface)' : 'transparent',
              boxShadow: activeTab === 'lookup' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            Look Up Ticket
          </button>
        </div>

        {/* Tab contents */}
        {activeTab === 'create' ? (
          <div>
            {createdTicketId ? (
              <div className="card" style={{ borderColor: '#bbf7d0', background: '#f0fdf4', padding: 24 }}>
                <h3 style={{ color: '#166534', margin: '0 0 12px 0', fontSize: '1.25rem' }}>Ticket Created Successfully!</h3>
                <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: 'var(--radius)', border: '1px solid #dcfce7', marginBottom: 16 }}>
                  <p style={{ margin: '0 0 6px 0', fontSize: '0.8rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Your Ticket ID:</p>
                  <p className="mono" style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-dark)' }}>{createdTicketId}</p>
                </div>
                <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: 'var(--text2)', lineHeight: 1.55 }}>
                  Save this ID to look up your ticket status later. We will also respond to your email as soon as possible.
                </p>
                <button
                  onClick={() => {
                    setCreatedTicketId(null);
                    setActiveTab('lookup');
                    setLookupForm(prev => ({ ...prev, ticket_id: createdTicketId }));
                  }}
                  className="btn btn-secondary btn-full"
                >
                  Look Up This Ticket
                </button>
              </div>
            ) : (
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Submit a New Ticket</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text3)' }}>
                    Tell us about your issue and we'll get back to you shortly
                  </p>
                </div>
                <div className="card-body">
                  <form onSubmit={handleCreateSubmit}>
                    <div className="form-group">
                      <label className="form-label">Your Name</label>
                      <input
                        className={`form-input ${createErrors.customer_name ? 'error' : ''}`}
                        placeholder="John Doe"
                        value={createForm.customer_name}
                        onChange={e => setCreateField('customer_name', e.target.value)}
                      />
                      {createErrors.customer_name && <div className="form-error">{createErrors.customer_name}</div>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input
                        className={`form-input ${createErrors.customer_email ? 'error' : ''}`}
                        type="email"
                        placeholder="you@example.com"
                        value={createForm.customer_email}
                        onChange={e => setCreateField('customer_email', e.target.value)}
                      />
                      {createErrors.customer_email && <div className="form-error">{createErrors.customer_email}</div>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Subject</label>
                      <input
                        className={`form-input ${createErrors.subject ? 'error' : ''}`}
                        placeholder="Brief description of your issue"
                        value={createForm.subject}
                        onChange={e => setCreateField('subject', e.target.value)}
                      />
                      {createErrors.subject && <div className="form-error">{createErrors.subject}</div>}
                    </div>

                    <div className="form-group" style={{ marginBottom: 24 }}>
                      <label className="form-label">Description</label>
                      <textarea
                        className={`form-input ${createErrors.description ? 'error' : ''}`}
                        placeholder="Please provide as much detail as possible..."
                        rows={6}
                        value={createForm.description}
                        onChange={e => setCreateField('description', e.target.value)}
                      />
                      {createErrors.description && <div className="form-error">{createErrors.description}</div>}
                    </div>

                    <button type="submit" className="btn btn-primary btn-full" disabled={creating}>
                      {creating ? (
                        <>
                          <span className="spinner" style={{ width: 14, height: 14 }} />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <SendIcon size={16} />
                          <span>Submit Ticket</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 24 }}>
            <div className="card">
              <div className="card-header">
                <span className="card-title">Look Up Your Ticket</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text3)' }}>
                  Enter your ticket ID and email to view the status
                </p>
              </div>
              <div className="card-body">
                <form onSubmit={handleLookupSubmit}>
                  <div className="form-group">
                    <label className="form-label">Ticket ID</label>
                    <input
                      className={`form-input ${lookupErrors.ticket_id ? 'error' : ''}`}
                      placeholder="e.g., TKT-123456"
                      value={lookupForm.ticket_id}
                      onChange={e => setLookupField('ticket_id', e.target.value)}
                    />
                    {lookupErrors.ticket_id && <div className="form-error">{lookupErrors.ticket_id}</div>}
                  </div>

                  <div className="form-group" style={{ marginBottom: 24 }}>
                    <label className="form-label">Email Address</label>
                    <input
                      className={`form-input ${lookupErrors.customer_email ? 'error' : ''}`}
                      type="email"
                      placeholder="you@example.com"
                      value={lookupForm.customer_email}
                      onChange={e => setLookupField('customer_email', e.target.value)}
                    />
                    {lookupErrors.customer_email && <div className="form-error">{lookupErrors.customer_email}</div>}
                  </div>

                  <button type="submit" className="btn btn-primary btn-full" disabled={searching}>
                    {searching ? (
                      <>
                        <span className="spinner" style={{ width: 14, height: 14 }} />
                        <span>Searching...</span>
                      </>
                    ) : (
                      <>
                        <SearchIcon size={16} />
                        <span>Search</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Lookup Result details */}
            {lookupResult && (
              <div className="card" style={{ animation: 'fadeIn 0.25s ease-out' }}>
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{lookupResult.subject}</h3>
                    <p className="mono" style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text3)' }}>
                      ID: {lookupResult.ticket_id}
                    </p>
                  </div>
                  <StatusBadge status={lookupResult.status} />
                </div>
                <div className="card-body">
                  <div className="form-row" style={{ marginBottom: 20 }}>
                    <div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 600 }}>Created</div>
                      <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{new Date(lookupResult.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true })}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 600 }}>Last Updated</div>
                      <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{new Date(lookupResult.updated_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true })}</div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginBottom: 20 }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 700 }}>Description</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text2)', whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>
                      {lookupResult.description}
                    </p>
                  </div>

                  {/* Public Notes (Support Responses) */}
                  {lookupResult.notes && lookupResult.notes.filter(n => !n.is_internal).length > 0 && (
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                      <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: 700 }}>Support Notes</h4>
                      <div style={{ display: 'grid', gap: 12 }}>
                        {lookupResult.notes.filter(n => !n.is_internal).map(note => (
                          <div key={note.id} style={{ background: 'var(--surface-soft)', padding: 12, borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                              <span>👤 {note.author}</span>
                              <span>{new Date(note.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true })}</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.5 }}>
                              {note.note_text}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="landing-footer" style={{ marginTop: 'auto' }}>
        <span>© 2026 Datastraw Technologies · SupportCRM v2.0</span>
      </footer>
    </div>
  );
}
