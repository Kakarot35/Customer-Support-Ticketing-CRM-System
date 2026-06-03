export function StatusBadge({ status }) {
  const map = {
    'Open':        'badge badge-open',
    'In Progress': 'badge badge-progress',
    'Closed':      'badge badge-closed',
  };
  return <span className={map[status] || 'badge'}>{status}</span>;
}

export function PriorityBadge({ priority }) {
  const map = {
    'Low':    'badge badge-low',
    'Medium': 'badge badge-medium',
    'High':   'badge badge-high',
    'Urgent': 'badge badge-urgent',
  };
  return <span className={map[priority] || 'badge'}>{priority}</span>;
}

export function Spinner() {
  return <div className="loading-wrap"><div className="spinner" /><span>Loading…</span></div>;
}

export function EmptyState({ icon = '📭', title, desc, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      {desc && <p>{desc}</p>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}
