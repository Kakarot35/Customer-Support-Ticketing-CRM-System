import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import { useToast } from '../../context/ToastContext';
import Header from '../../components/Header';
import { BackIcon, CheckIcon } from '../../components/Icons';

export default function NewTicket() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    customer_name: user?.name || '',
    customer_email: user?.email || '',
    subject: '', description: '', priority: 'Medium',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.customer_name.trim()) e.customer_name = 'Required';
    if (!form.customer_email.trim()) e.customer_email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(form.customer_email)) e.customer_email = 'Invalid email';
    if (!form.subject.trim()) e.subject = 'Required';
    if (!form.description.trim()) e.description = 'Required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const res = await api.customerCreateTicket(form);
      toast(`Ticket ${res.ticket_id} created!`, 'success');
      navigate(`/my-tickets/${res.ticket_id}`);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <div className="container mx-auto px-4 py-8" style={{ maxWidth: 1200, margin: '0 auto', flex: 1 }}>
        <div className="page-header" style={{ marginBottom: 24, padding: 0 }}>
          <div className="page-header-left">
            <h2 style={{ margin: 0, fontSize: '1.85rem' }}>New Support Ticket</h2>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text3)' }}>Describe your issue and we'll get back to you</p>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate('/my-tickets')}>
            <BackIcon size={16} />
            <span>Back</span>
          </button>
        </div>

        <div className="page-body" style={{ padding: 0 }}>
          <div style={{ maxWidth: 660, margin: '0 auto' }}>
            <div className="card">
              <div className="card-header">
                <span className="card-title">Ticket Details</span>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Your Name *</label>
                      <input className={`form-input ${errors.customer_name ? 'error' : ''}`}
                        placeholder="Full name" value={form.customer_name}
                        onChange={e => set('customer_name', e.target.value)} />
                      {errors.customer_name && <div className="form-error">{errors.customer_name}</div>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Your Email *</label>
                      <input className={`form-input ${errors.customer_email ? 'error' : ''}`}
                        type="email" placeholder="your@email.com" value={form.customer_email}
                        onChange={e => set('customer_email', e.target.value)} />
                      {errors.customer_email && <div className="form-error">{errors.customer_email}</div>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Subject *</label>
                      <input className={`form-input ${errors.subject ? 'error' : ''}`}
                        placeholder="Brief summary of your issue" value={form.subject}
                        onChange={e => set('subject', e.target.value)} />
                      {errors.subject && <div className="form-error">{errors.subject}</div>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select className="form-input" value={form.priority} onChange={e => set('priority', e.target.value)}>
                      <option value="Low">Low — General question</option>
                      <option value="Medium">Medium — Issue affecting usage</option>
                      <option value="High">High — Significant impact</option>
                      <option value="Urgent">Urgent — Critical / service down</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 24 }}>
                    <label className="form-label">Description *</label>
                    <textarea className={`form-input ${errors.description ? 'error' : ''}`}
                      placeholder="Describe your issue in detail. Include any error messages, steps to reproduce, etc."
                      rows={5} value={form.description}
                      onChange={e => set('description', e.target.value)} />
                    {errors.description && <div className="form-error">{errors.description}</div>}
                  </div>

                  <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
                      {loading ? (
                        <>
                          <span className="spinner" style={{ width: 14, height: 14 }} />
                          <span>Submitting…</span>
                        </>
                      ) : (
                        <>
                          <CheckIcon size={16} />
                          <span>Submit Ticket</span>
                        </>
                      )}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/my-tickets')}>Cancel</button>
                  </div>
                </form>
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
