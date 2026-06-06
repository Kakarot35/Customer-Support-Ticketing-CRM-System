const BASE = process.env.REACT_APP_API_URL || '';

function getToken() {
  return localStorage.getItem('crm_token');
}

function addZToDates(obj) {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(addZToDates);
  }
  if (typeof obj === 'object') {
    const newObj = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && (key.endsWith('_at') || key === 'last_seen')) {
        if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}/.test(value) && !value.endsWith('Z') && !value.includes('+')) {
          newObj[key] = value.replace(' ', 'T') + 'Z';
        } else {
          newObj[key] = value;
        }
      } else {
        newObj[key] = addZToDates(value);
      }
    }
    return newObj;
  }
  return obj;
}

async function req(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || `Error ${res.status}`);
  return addZToDates(data);
}

export const api = {
  // Auth
  login:    (body) => req('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => req('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  me:       ()     => req('/api/auth/me'),

  // Customer
  customerCreateTicket: (body) => req('/api/customer/tickets', { method: 'POST', body: JSON.stringify(body) }),
  customerListTickets:  (p={}) => req(`/api/customer/tickets?${new URLSearchParams(clean(p))}`),
  customerGetTicket:    (id)   => req(`/api/customer/tickets/${id}`),

  // Admin
  adminListTickets: (p={}) => req(`/api/admin/tickets?${new URLSearchParams(clean(p))}`),
  adminGetTicket:   (id)   => req(`/api/admin/tickets/${id}`),
  adminUpdateTicket:(id,b) => req(`/api/admin/tickets/${id}`, { method: 'PUT', body: JSON.stringify(b) }),
  adminDeleteTicket:(id)   => req(`/api/admin/tickets/${id}`, { method: 'DELETE' }),
  adminGetStats:    ()     => req('/api/admin/tickets/stats'),

  // Public support CRM experience
  publicCreateTicket: (body) => req('/api/tickets', { method: 'POST', body: JSON.stringify(body) }),
  publicListTickets:  (p={}) => req(`/api/tickets?${new URLSearchParams(clean(p))}`),
  publicGetTicket:    (id)   => req(`/api/tickets/${id}`),
  publicUpdateTicket: (id,b) => req(`/api/tickets/${id}`, { method: 'PUT', body: JSON.stringify(b) }),
  publicLookupTicket: (body) => req('/api/customer/tickets/lookup', { method: 'POST', body: JSON.stringify(body) }),
};

function clean(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([,v]) => v != null && v !== '' && v !== 'All'));
}

