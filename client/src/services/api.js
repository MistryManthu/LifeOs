const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  ...(localStorage.getItem('token') && {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  }),
});

const request = async (method, path, body) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: getHeaders(),
    ...(body && { body: JSON.stringify(body) }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

// ─── Auth ─────────────────────────────────────────────────────
export const api = {
  auth: {
    register: (body) => request('POST', '/api/auth/register', body),
    login:    (body) => request('POST', '/api/auth/login', body),
  },

  user: {
    me: () => request('GET', '/api/user/me'),
  },

  blueprint: {
    get:      ()     => request('GET',   '/api/blueprint'),
    create:   (body) => request('POST',  '/api/blueprint', body),
    update:   (body) => request('PUT',   '/api/blueprint', body),
    complete: ()     => request('PATCH', '/api/blueprint/complete'),
  },

  goals: {
    list:   ()       => request('GET',    '/api/goals'),
    create: (body)   => request('POST',   '/api/goals', body),
    update: (id, b)  => request('PATCH',  `/api/goals/${id}`, b),
    delete: (id)     => request('DELETE', `/api/goals/${id}`),
  },

  dailyLogs: {
    today:  ()     => request('GET',   '/api/daily-logs/today'),
    list:   ()     => request('GET',   '/api/daily-logs'),
    update: (id,b) => request('PATCH', `/api/daily-logs/${id}`, b),
  },

  memories: {
    list:    (type) => request('GET',    `/api/memories${type ? `?type=${type}` : ''}`),
    add:     (body) => request('POST',   '/api/memories', body),
    update:  (id,b) => request('PATCH',  `/api/memories/${id}`, b),
    remove:  (id)   => request('DELETE', `/api/memories/${id}`),
    patterns: ()    => request('GET',    '/api/memories/patterns'),
  },

  lifeEvents: {
    list:   ()     => request('GET',    '/api/life-events'),
    create: (body) => request('POST',   '/api/life-events', body),
    delete: (id)   => request('DELETE', `/api/life-events/${id}`),
  },

  ai: {
    morning:      (body) => request('POST', '/api/ai/morning', body),
    evening:      (body) => request('POST', '/api/ai/evening', body),
    weeklyReview: (body) => request('POST', '/api/ai/weekly-review', body),
    bottleneck:   ()     => request('POST', '/api/ai/bottleneck'),
    lifeSnapshot: ()     => request('POST', '/api/ai/life-snapshot'),
    chat:         (body) => request('POST', '/api/ai/chat', body),
  },
};
