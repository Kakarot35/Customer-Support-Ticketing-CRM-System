import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { PriorityBadge, StatusBadge } from '../../components/UI';

export default function AdminPortal() {
  const [tickets, setTickets] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [update, setUpdate] = useState({ status: '', notes: '' });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.publicListTickets({ status: statusFilter, search });
      setTickets(data);
      if (!selectedId && data.length) setSelectedId(data[0].ticket_id);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  }, [search, selectedId, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(loadTickets, 250);
    return () => clearTimeout(timer);
  }, [loadTickets]);

  useEffect(() => {
    if (!selectedId) {
      setSelectedTicket(null);
      return;
    }

    api.publicGetTicket(selectedId)
      .then((ticket) => {
        setSelectedTicket(ticket);
        setUpdate({ status: '', notes: '' });
      })
      .catch((error) => setMessage({ type: 'error', text: error.message }));
  }, [selectedId]);

  const stats = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter((ticket) => ticket.status === 'Open').length,
    progress: tickets.filter((ticket) => ticket.status === 'In Progress').length,
    closed: tickets.filter((ticket) => ticket.status === 'Closed').length,
  }), [tickets]);

  const submitUpdate = async (event) => {
    event.preventDefault();
    if (!selectedId || (!update.status && !update.notes.trim())) {
      setMessage({ type: 'error', text: 'Please provide a status update or note.' });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      await api.publicUpdateTicket(selectedId, {
        status: update.status || undefined,
        notes: update.notes.trim() || undefined,
        author: 'Agent',
        is_internal: false,
      });
      const ticket = await api.publicGetTicket(selectedId);
      setSelectedTicket(ticket);
      setUpdate({ status: '', notes: '' });
      setMessage({ type: 'success', text: 'Ticket updated successfully.' });
      loadTickets();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="site-shell">
      <section className="hero hero-small hero-admin">
        <div className="hero-overlay" />
        <Link to="/" className="hero-home">Support CRM</Link>
        <div className="hero-content">
          <h1>Admin Dashboard</h1>
          <p>Manage support tickets and customer issues</p>
        </div>
      </section>

      <main className="container admin-layout">
        <aside className="admin-sidebar">
          <section className="soft-card">
            <h2>Filters</h2>
            <label>Status
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Closed">Closed</option>
              </select>
            </label>
            <label>Search
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by subject, email..." />
            </label>
            <button className="btn btn-secondary btn-full" onClick={() => { setStatusFilter(''); setSearch(''); }}>Clear Filters</button>
          </section>

          <section className="stats-panel">
            <Stat label="Total" value={stats.total} />
            <Stat label="Open" value={stats.open} />
            <Stat label="In Progress" value={stats.progress} />
            <Stat label="Closed" value={stats.closed} />
          </section>
        </aside>

        <div className="admin-main">
          {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

          <section className="soft-card">
            <div className="section-heading">
              <div>
                <h2>Tickets</h2>
                <p>{tickets.length} ticket{tickets.length !== 1 ? 's' : ''} found</p>
              </div>
            </div>
            {loading ? (
              <div className="loading-wrap"><div className="spinner" /><span>Loading tickets...</span></div>
            ) : tickets.length === 0 ? (
              <div className="empty-state"><h3>No tickets found</h3><p>Try adjusting your search or filters.</p></div>
            ) : (
              <div className="ticket-list">
                {tickets.map((ticket) => (
                  <button
                    key={ticket.ticket_id}
                    className={`ticket-card ${selectedId === ticket.ticket_id ? 'selected' : ''}`}
                    onClick={() => setSelectedId(ticket.ticket_id)}
                  >
                    <div>
                      <h3>{ticket.subject}</h3>
                      <p>{ticket.customer_name} - {ticket.customer_email}</p>
                      <span className="mono">{ticket.ticket_id}</span>
                    </div>
                    <div className="ticket-card-meta">
                      <StatusBadge status={ticket.status} />
                      <PriorityBadge priority={ticket.priority} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>

          {selectedTicket && (
            <section className="soft-card ticket-detail-card">
              <div className="detail-heading">
                <div>
                  <h2>{selectedTicket.subject}</h2>
                  <p className="mono">ID: {selectedTicket.ticket_id}</p>
                </div>
                <StatusBadge status={selectedTicket.status} />
              </div>

              <div className="info-grid four">
                <Info label="Customer" value={selectedTicket.customer_name} />
                <Info label="Email" value={selectedTicket.customer_email} />
                <Info label="Created" value={new Date(selectedTicket.created_at).toLocaleString()} />
                <Info label="Updated" value={new Date(selectedTicket.updated_at).toLocaleString()} />
              </div>

              <div className="divider-line" />
              <h3>Description</h3>
              <p className="preserve-lines">{selectedTicket.description}</p>

              {selectedTicket.notes?.length > 0 && (
                <>
                  <div className="divider-line" />
                  <h3>Notes History</h3>
                  <div className="notes-list">
                    {selectedTicket.notes.map((note) => (
                      <article className="note-card public" key={note.id}>
                        <div className="note-time">{new Date(note.created_at).toLocaleString()}</div>
                        <p>{note.note_text}</p>
                      </article>
                    ))}
                  </div>
                </>
              )}

              <div className="divider-line" />
              <h3>Update Ticket</h3>
              <form className="form-stack" onSubmit={submitUpdate}>
                <label>Status
                  <select value={update.status} onChange={(e) => setUpdate((form) => ({ ...form, status: e.target.value }))}>
                    <option value="">Keep current status</option>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                  </select>
                </label>
                <label>Add Note
                  <textarea value={update.notes} onChange={(e) => setUpdate((form) => ({ ...form, notes: e.target.value }))} placeholder="Add a note to this ticket..." />
                </label>
                <button className="btn btn-primary btn-full" disabled={saving}>{saving ? 'Updating...' : 'Update Ticket'}</button>
              </form>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat-pill">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <span className="info-label">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
