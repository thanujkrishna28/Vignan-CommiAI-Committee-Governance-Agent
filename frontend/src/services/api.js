import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor for 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ───────────────────────────────────────────────────────────────
export const authApi = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', {
      email,
      password,
    });
    return res.data;
  },
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  changePassword: async (oldPassword, newPassword) => {
    const res = await api.post('/auth/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return res.data;
  },
};

// ─── Committees API ─────────────────────────────────────────────────────────
export const committeesApi = {
  list: async (params = {}) => {
    const res = await api.get('/committees', { params });
    return res.data;
  },
  get: async (id) => {
    const res = await api.get(`/committees/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/committees', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/committees/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/committees/${id}`);
    return res.data;
  },
  getMembers: async (id) => {
    const res = await api.get(`/committees/${id}/members`);
    return res.data;
  },
  addMember: async (committeeId, data) => {
    const res = await api.post(`/committees/${committeeId}/members`, data);
    return res.data;
  },
  removeMember: async (committeeId, memberId) => {
    const res = await api.delete(`/committees/${committeeId}/members/${memberId}`);
    return res.data;
  },
  getRequirements: async (id) => {
    const res = await api.get(`/committees/${id}/requirements`);
    return res.data;
  },
};

// ─── Members API ────────────────────────────────────────────────────────────
export const membersApi = {
  list: async (params = {}) => {
    const res = await api.get('/members', { params });
    return res.data;
  },
  get: async (id) => {
    const res = await api.get(`/members/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/members', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/members/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/members/${id}`);
    return res.data;
  },
};

// ─── Meetings API ───────────────────────────────────────────────────────────
export const meetingsApi = {
  list: async (params = {}) => {
    const res = await api.get('/meetings', { params });
    return res.data;
  },
  get: async (id) => {
    const res = await api.get(`/meetings/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/meetings', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/meetings/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/meetings/${id}`);
    return res.data;
  },
  updateAttendance: async (id, attendances) => {
    const res = await api.post(`/meetings/${id}/attendance`, attendances);
    return res.data;
  },
  checkQuorum: async (id) => {
    const res = await api.get(`/meetings/${id}/quorum`);
    return res.data;
  },
  overrideQuorum: async (id, reason) => {
    const res = await api.post(`/meetings/${id}/override-quorum`, { reason });
    return res.data;
  },
  getAgenda: async (id) => {
    const res = await api.get(`/meetings/${id}/agenda`);
    return res.data;
  },
  updateAgenda: async (id, data) => {
    const res = await api.post(`/meetings/${id}/agenda`, data);
    return res.data;
  },
  getMinutes: async (id) => {
    const res = await api.get(`/meetings/${id}/minutes`);
    return res.data;
  },
  saveMinutes: async (id, data) => {
    const res = await api.post(`/meetings/${id}/minutes`, data);
    return res.data;
  },
  approveMinutes: async (id, comments = '') => {
    const res = await api.post(`/meetings/${id}/minutes/approve`, { comments });
    return res.data;
  },
};

// ─── Actions API ────────────────────────────────────────────────────────────
export const actionsApi = {
  list: async (params = {}) => {
    const res = await api.get('/actions', { params });
    return res.data;
  },
  get: async (id) => {
    const res = await api.get(`/actions/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/actions', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/actions/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/actions/${id}`);
    return res.data;
  },
};

// ─── Minutes API ───────────────────────────────────────────────────────────
export const minutesApi = {
  list: async (params = {}) => {
    const res = await api.get('/minutes', { params });
    return res.data;
  },
  get: async (id) => {
    const res = await api.get(`/minutes/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/minutes', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/minutes/${id}`, data);
    return res.data;
  },
  requestOtp: async (id) => {
    const res = await api.post(`/minutes/${id}/request-otp`);
    return res.data;
  },
  approve: async (id, data = {}) => {
    const payload = typeof data === 'string' ? { comments: data } : data;
    const res = await api.post(`/minutes/${id}/approve`, payload);
    return res.data;
  },
  generateWithAi: async (meetingId, notes) => {
    const res = await api.post('/ai/generate-minutes', { meeting_id: meetingId, notes });
    return res.data;
  },
};

// ─── Compliance API ─────────────────────────────────────────────────────────
export const complianceApi = {
  getAll: async () => {
    const res = await api.get('/compliance');
    return res.data;
  },
  listAll: async () => {
    const res = await api.get('/compliance');
    return res.data;
  },
  getStatus: async (committeeId) => {
    const res = await api.get(`/compliance/${committeeId}`);
    return res.data;
  },
  runCheck: async (committeeId) => {
    const res = await api.post(`/compliance/check?committee_id=${committeeId}`);
    return res.data;
  },
  calculateAll: async () => {
    const res = await api.get('/compliance');
    return res.data;
  },
};

// ─── Reports API ────────────────────────────────────────────────────────────
export const reportsApi = {
  getDashboardStats: async () => {
    const res = await api.get('/reports/dashboard-stats');
    return res.data;
  },
  getComplianceReport: async () => {
    const res = await api.get('/reports/compliance');
    return res.data;
  },
  getTenureReport: async (params = {}) => {
    const res = await api.get('/reports/tenure', { params });
    return res.data;
  },
  getMeetingsReport: async (params = {}) => {
    const res = await api.get('/reports/meetings', { params });
    return res.data;
  },
  getActionsReport: async (params = {}) => {
    const res = await api.get('/reports/actions', { params });
    return res.data;
  },
  getAuditPacket: async (params = {}) => {
    const res = await api.get('/reports/audit-packet', { params });
    return res.data;
  },
};

// ─── AI API ─────────────────────────────────────────────────────────────────
export const aiApi = {
  chat: async (message, context = {}) => {
    const res = await api.post('/ai/chat', { message, ...context });
    return res.data;
  },
  generateAgenda: async (committeeId, meetingId, topics = []) => {
    const res = await api.post('/ai/generate-agenda', {
      committee_id: committeeId,
      meeting_id: meetingId,
      topics,
    });
    return res.data;
  },
  generateMinutes: async (meetingId, rawNotes = '') => {
    const res = await api.post('/ai/generate-minutes', {
      meeting_id: meetingId,
      raw_notes: rawNotes,
    });
    return res.data;
  },
  extractActions: async (meetingId, text = '') => {
    const res = await api.post('/ai/extract-actions', {
      meeting_id: meetingId,
      text,
    });
    return res.data;
  },
  analyzeCompliance: async (committeeId) => {
    const res = await api.post('/ai/analyze-compliance', {
      committee_id: committeeId,
    });
    return res.data;
  },
};

// ─── Documents API ──────────────────────────────────────────────────────────
export const documentsApi = {
  list: async (params = {}) => {
    const res = await api.get('/documents', { params });
    return res.data;
  },
  upload: async (file, committeeId, category = 'OTHER') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('committee_id', committeeId);
    formData.append('category', category);
    const res = await api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/documents/${id}`);
    return res.data;
  },
};

// ─── Notifications API ──────────────────────────────────────────────────────
export const notificationsApi = {
  list: async (params = {}) => {
    const res = await api.get('/notifications', { params });
    return res.data;
  },
  markRead: async (id) => {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data;
  },
  markAllRead: async () => {
    const res = await api.put('/notifications/read-all');
    return res.data;
  },
  getLogs: async (params = {}) => {
    const res = await api.get('/notifications/logs', { params });
    return res.data;
  },
  retryEmail: async (id) => {
    const res = await api.post(`/notifications/logs/${id}/retry`);
    return res.data;
  },
  getRules: async () => {
    const res = await api.get('/notifications/rules');
    return res.data;
  },
  updateRule: async (id, data) => {
    const res = await api.put(`/notifications/rules/${id}`, data);
    return res.data;
  },
  triggerService: async (data) => {
    const res = await api.post('/notifications/trigger-service', data);
    return res.data;
  },
  runSweep: async () => {
    const res = await api.post('/notifications/run-sweep');
    return res.data;
  },
};

export default api;
