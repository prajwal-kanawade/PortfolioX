import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export function resolveAssetUrl(url) {
  if (!url) return url;
  return url.startsWith('/') ? `${API_ORIGIN}${url}` : url;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Endpoints that identify their subject purely from the request body (an email, an OTP, a
// device-verification token) and never accept [Authorize] server-side. A stale or unrelated
// token from an already-logged-in session has no business riding along on these - e.g. someone
// registering a second account while still signed into their first shouldn't have that first
// account's Bearer token attached to /auth/send-otp.
const PUBLIC_AUTH_PATHS = [
  '/auth/register',
  '/auth/login',
  '/auth/send-otp',
  '/auth/verify-otp',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-login-device',
];

// Add auth token to every request except the public auth endpoints above. Exact match only -
// startsWith would also match e.g. "/auth/login-history" against "/auth/login" and incorrectly
// strip the token from that (very much authenticated) endpoint.
api.interceptors.request.use(
  (config) => {
    const isPublicAuthPath = PUBLIC_AUTH_PATHS.includes(config.url);
    if (!isPublicAuthPath) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
          return api(originalRequest);
        } catch (err) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  sendOtp: (email) => api.post('/auth/send-otp', { email }),
  verifyOtp: (email, otp) => api.post('/auth/verify-otp', { email, otp }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (email, otp, newPassword) => api.post('/auth/reset-password', { email, otp, newPassword }),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  logout: () => api.post('/auth/logout'),
  verifyLoginDevice: (token) => api.post('/auth/verify-login-device', { token }),
  getTrustedDevices: () => api.get('/auth/trusted-devices'),
  revokeTrustedDevice: (id) => api.delete(`/auth/trusted-devices/${id}`),
  getLoginHistory: () => api.get('/auth/login-history'),
  uploadProfilePhoto: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/auth/profile/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  requestEmailChange: (newEmail) => api.post('/auth/request-email-change', { newEmail }),
  confirmEmailChange: (newEmail, otp) => api.post('/auth/confirm-email-change', { newEmail, otp }),
  changePassword: (currentPassword, newPassword) => api.put('/auth/change-password', { currentPassword, newPassword }),
  logoutAll: () => api.post('/auth/logout-all'),
  exportData: () => api.get('/auth/export-data', { responseType: 'blob' }),
  deleteAccount: (password) => api.delete('/auth/account', { data: { password } }),
};

// Settings endpoints
export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

// Support endpoints
export const supportAPI = {
  submitComplaint: (subject, message) => api.post('/support/complaints', { subject, message }),
  submitBugReport: (description, pageUrl) => api.post('/support/bug-reports', { description, pageUrl }),
};

// Portfolio endpoints
export const portfolioAPI = {
  getTemplates: () => api.get('/portfolios/templates'),
  create: (data) => api.post('/portfolios', data),
  getById: (id) => api.get(`/portfolios/${id}`),
  getBySlug: (slug) => api.get(`/portfolios/public/${slug}`),
  getMyPortfolios: () => api.get('/portfolios/my-portfolios'),
  update: (id, data) => api.put(`/portfolios/${id}`, data),
  delete: (id) => api.delete(`/portfolios/${id}`),
  addProject: (portfolioId, data) => api.post(`/portfolios/${portfolioId}/projects`, data),
  addProjectLogEntry: (portfolioId, projectId, content) => api.post(`/portfolios/${portfolioId}/projects/${projectId}/log`, { content }),
  uploadProjectPhoto: (portfolioId, projectId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/portfolios/${portfolioId}/projects/${projectId}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  addSkill: (portfolioId, data) => api.post(`/portfolios/${portfolioId}/skills`, data),
  getSkillSuggestions: (portfolioId) => api.get(`/portfolios/${portfolioId}/skills/suggestions`),
  addExperience: (portfolioId, data) => api.post(`/portfolios/${portfolioId}/experience`, data),
  addEducation: (portfolioId, data) => api.post(`/portfolios/${portfolioId}/education`, data),
  getScore: (portfolioId) => api.get(`/portfolios/${portfolioId}/score`),
  explore: (params) => api.get('/portfolios/explore', { params }),
  uploadPhoto: (portfolioId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/portfolios/${portfolioId}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadGalleryPhoto: (portfolioId, file, caption) => {
    const formData = new FormData();
    formData.append('file', file);
    if (caption) formData.append('caption', caption);
    return api.post(`/portfolios/${portfolioId}/gallery`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteGalleryPhoto: (portfolioId, photoId) => api.delete(`/portfolios/${portfolioId}/gallery/${photoId}`),
  addBook: (portfolioId, data) => api.post(`/portfolios/${portfolioId}/books`, data),
  uploadBookCover: (portfolioId, bookId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/portfolios/${portfolioId}/books/${bookId}/cover`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteBook: (portfolioId, bookId) => api.delete(`/portfolios/${portfolioId}/books/${bookId}`),
  getAvailability: (portfolioId, date) => api.get(`/portfolios/${portfolioId}/appointments/availability`, { params: { date } }),
  bookAppointment: (portfolioId, data) => api.post(`/portfolios/${portfolioId}/appointments`, data),
  getAppointments: (portfolioId) => api.get(`/portfolios/${portfolioId}/appointments`),
  sendContactMessage: (portfolioId, data) => api.post(`/portfolios/${portfolioId}/contact`, data),
  getMyViewsByDay: () => api.get('/portfolios/my-views-by-day'),
  like: (id) => api.post(`/portfolios/${id}/like`),
  getLikes: (id) => api.get(`/portfolios/${id}/likes`),
};

// Admin endpoints
export const adminAPI = {
  getAllUsers: () => api.get('/admin/users'),
  getUser: (userId) => api.get(`/admin/users/${userId}`),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getStats: () => api.get('/admin/stats'),
  getAnalytics: () => api.get('/admin/analytics'),
  banUser: (userId, reason) => api.post(`/admin/users/${userId}/ban`, { reason }),
  unbanUser: (userId) => api.post(`/admin/users/${userId}/unban`),
  approveUser: (userId) => api.post(`/admin/users/${userId}/approve`),
  deleteInactiveUsers: (days) => api.post('/admin/users/delete-inactive', null, { params: { days } }),
  getComplaints: () => api.get('/admin/complaints'),
  resolveComplaint: (id) => api.put(`/admin/complaints/${id}/resolve`),
  getBugReports: () => api.get('/admin/bug-reports'),
  resolveBugReport: (id) => api.put(`/admin/bug-reports/${id}/resolve`),
};

// Admin settings endpoints (Phase 3-4)
export const adminSettingsAPI = {
  getGeneral: () => api.get('/admin/settings/general'),
  updateGeneral: (data) => api.put('/admin/settings/general', data),
  getPlans: () => api.get('/admin/settings/plans'),
  createPlan: (data) => api.post('/admin/settings/plans', data),
  updatePlan: (id, data) => api.put(`/admin/settings/plans/${id}`, data),
  deletePlan: (id) => api.delete(`/admin/settings/plans/${id}`),
  getPayments: () => api.get('/admin/settings/payments'),
  refundPayment: (id, reason) => api.post(`/admin/settings/payments/${id}/refund`, { reason }),
  getEmailTemplates: () => api.get('/admin/settings/email-templates'),
  getEmailTemplate: (key) => api.get(`/admin/settings/email-templates/${key}`),
  updateEmailTemplate: (key, subject, htmlBody) => api.put(`/admin/settings/email-templates/${key}`, { subject, htmlBody }),
  previewEmailTemplate: (key, subject, htmlBody) => api.post(`/admin/settings/email-templates/${key}/preview`, { subject, htmlBody }),
  getStorageUsage: () => api.get('/admin/settings/system/storage'),
  downloadBackup: () => api.get('/admin/settings/system/backup', { responseType: 'blob' }),
  getErrorLogs: () => api.get('/admin/settings/system/error-logs'),
};

// Public site settings (no auth) - name/logo/footer/maintenance mode
export const siteAPI = {
  getPublicSettings: () => api.get('/site-settings'),
};

// Billing endpoints - Razorpay Checkout (test mode)
export const billingAPI = {
  createRazorpayOrder: () => api.post('/billing/razorpay/create-order'),
  verifyRazorpayPayment: (data) => api.post('/billing/razorpay/verify', data),
  downgrade: () => api.post('/billing/downgrade'),
  getMySubscription: () => api.get('/billing/my-subscription'),
  getPayments: () => api.get('/billing/payments'),
};

// AI builder + suggestion endpoints (chat/generate are Pro-only; suggest is Pro-only too)
export const aiAPI = {
  chat: (messages) => api.post('/ai/chat', { messages }),
  suggestTemplate: (data) => api.post('/ai/suggest-template', data),
  generatePortfolio: (templateId, data) => api.post('/ai/generate-portfolio', { templateId, data }),
  resumeChat: (messages) => api.post('/ai/resume-chat', { messages }),
  generateResume: (data) => api.post('/ai/generate-resume', { data }),
  suggest: (category, field, context) => api.post('/ai/suggest', { category, field, context }),
  getUsage: () => api.get('/ai/usage'),
};

// Resume endpoints
export const resumeAPI = {
  create: (data) => api.post('/resumes', data),
  getById: (id) => api.get(`/resumes/${id}`),
  getMyResumes: () => api.get('/resumes/my-resumes'),
  update: (id, data) => api.put(`/resumes/${id}`, data),
  delete: (id) => api.delete(`/resumes/${id}`),
  addExperience: (resumeId, data) => api.post(`/resumes/${resumeId}/experience`, data),
  addEducation: (resumeId, data) => api.post(`/resumes/${resumeId}/education`, data),
  addSkillCategory: (resumeId, data) => api.post(`/resumes/${resumeId}/skills`, data),
  getScore: (resumeId, jobDescription) => api.get(`/resumes/${resumeId}/score`, { params: jobDescription ? { jobDescription } : {} }),
};

export const usersAPI = {
  getPublicProfile: (id) => api.get(`/users/${id}/public-profile`),
  follow: (id) => api.post(`/users/${id}/follow`),
  getFollowers: (id) => api.get(`/users/${id}/followers`),
  getFollowing: (id) => api.get(`/users/${id}/following`),
};

export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
};

export const commentsAPI = {
  getForPortfolio: (portfolioId) => api.get(`/portfolios/${portfolioId}/comments`),
  addComment: (portfolioId, content) => api.post(`/portfolios/${portfolioId}/comments`, { content }),
  addReply: (commentId, content) => api.post(`/comments/${commentId}/replies`, { content }),
  likeComment: (id) => api.post(`/comments/${id}/like`),
  deleteComment: (id) => api.delete(`/comments/${id}`),
};

export default api;
