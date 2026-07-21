/**
 * api.js — Centralized Axios instance for Care Nest
 * =====================================================
 * - Base URL: always relative (Vite proxies /api → http://127.0.0.1:5000)
 * - Request interceptor: auto-injects Bearer token from localStorage
 * - Response interceptor: handles 401 (clears token, redirects to /signin)
 * - All API methods return response.data directly so callers stay clean
 */

import axios from 'axios';

// ── Core instance ─────────────────────────────────────────────────────────────
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api', // Use env var for prod, fallback to local proxy
    timeout: 30000,           // 30s — AI responses can be slow
    headers: {
        'Content-Type': 'application/json',
    },
});

// ── Request interceptor: attach token automatically ───────────────────────────
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 globally ────────────────────────────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid → clear everything and redirect
            localStorage.removeItem('token');
            localStorage.removeItem('chatMessages');
            localStorage.removeItem('currentConversationId');
            // Avoid redirect loop if already on signin/signup
            const path = window.location.pathname;
            if (path !== '/signin' && path !== '/signup' && path !== '/') {
                window.location.href = '/signin';
            }
        }
        return Promise.reject(error);
    }
);

export default api;


// ═══════════════════════════════════════════════════════════════════
//  AUTH SERVICE
// ═══════════════════════════════════════════════════════════════════

export const authService = {
    /** Sign up a new user */
    signup: (name, email, password, age) =>
        api.post('/signup', { name, email, password, age }).then(r => r.data),

    /** Verify user email */
    verifyEmail: (token) =>
        api.post('/verify-email', { token }).then(r => r.data),

    /** Sign in an existing user */
    login: (email, password) =>
        api.post('/login', { email, password }).then(r => r.data),

    /** Start an anonymous (guest) session */
    anonymousLogin: () =>
        api.post('/anonymous-login').then(r => r.data),

    /** Get current user profile (validates token) */
    getMe: () =>
        api.get('/me').then(r => r.data),

    /** Logout — clears chat on backend, preserves analytics */
    logout: () =>
        api.post('/logout').then(r => r.data),

    /** Update user profile fields (age_group, name, language) */
    updateProfile: (fields) =>
        api.post('/update-profile', fields).then(r => r.data),

    /** Request a password reset link (simulated) */
    forgotPassword: (email) =>
        api.post('/forgot-password', { email }).then(r => r.data),

    /** Reset the password with a token */
    resetPassword: (token, newPassword) =>
        api.post('/reset-password', { token, new_password: newPassword }).then(r => r.data),

    /** Change current user password */
    changePassword: (currentPassword, newPassword) =>
        api.post('/change-password', { current_password: currentPassword, new_password: newPassword }).then(r => r.data),
};


// ═══════════════════════════════════════════════════════════════════
//  CHAT SERVICE
// ═══════════════════════════════════════════════════════════════════

export const chatService = {
    /**
     * Send a chat message and get an AI response.
     * @param {string} message - The user's message text
     * @param {object} options - Optional: language, culturalContext, conversationHistory
     */
    sendMessage: (message, options = {}) =>
        api.post('/chat', {
            message,
            language: options.language || 'en-IN',
            culturalContext: options.culturalContext || '',
            conversationHistory: options.conversationHistory || [],
        }).then(r => r.data),

    /** Get all past conversations for the current user */
    getConversations: () =>
        api.get('/conversations').then(r => r.data),

    /** Get a single conversation by ID */
    getConversation: (id) =>
        api.get(`/conversations/${id}`).then(r => r.data),
};


// ═══════════════════════════════════════════════════════════════════
//  MOOD SERVICE
// ═══════════════════════════════════════════════════════════════════

export const moodService = {
    /**
     * Log a mood entry.
     * @param {string} mood - e.g. "happy", "anxious", "sad"
     * @param {number} intensity - 1–10
     * @param {string} notes - Optional freetext
     * @param {object} secondary - Optional: { label, intensity }
     */
    logMood: (mood, intensity, notes = '', secondary = null) => {
        const payload = { mood, intensity, notes };
        if (secondary) {
            payload.secondary_metric_label = secondary.label;
            payload.secondary_intensity = secondary.intensity;
        }
        return api.post('/mood', payload).then(r => r.data);
    },

    /** Get mood history (supports limit and offset) */
    getMoodHistory: (limit = null, offset = 0) => {
        const params = { offset };
        if (limit) params.limit = limit;
        return api.get('/mood/history', { params }).then(r => r.data);
    },
};


// ═══════════════════════════════════════════════════════════════════
//  JOURNAL SERVICE
// ═══════════════════════════════════════════════════════════════════

export const journalService = {
    /** Fetch all journal entries (newest first) */
    getEntries: () =>
        api.get('/journal').then(r => r.data),

    /** Create a new journal entry */
    createEntry: (content, title = '') =>
        api.post('/journal', { content, title }).then(r => r.data),

    /** Update an existing journal entry */
    updateEntry: (id, content, title = '') =>
        api.put(`/journal/${id}`, { content, title }).then(r => r.data),

    /** Delete a journal entry by ID */
    deleteEntry: (id) =>
        api.delete(`/journal/${id}`).then(r => r.data),
};


// ═══════════════════════════════════════════════════════════════════
//  ANALYTICS SERVICE
// ═══════════════════════════════════════════════════════════════════

export const analyticsService = {
    /** Get full analytics dashboard data for the current user */
    getAnalytics: (days = 7) =>
        api.get('/analytics', { params: { days } }).then(r => r.data),

    /** Get user distress status and resource recommendations */
    getDistressStatus: () =>
        api.get('/user-distress-status').then(r => r.data),
};


// ═══════════════════════════════════════════════════════════════════
//  RESOURCES SERVICE
// ═══════════════════════════════════════════════════════════════════

export const resourcesService = {
    /** Get mental health resources filtered by Indian state */
    getResources: (state = 'National') =>
        api.get('/resources', { params: { state } }).then(r => r.data),

};


// ═══════════════════════════════════════════════════════════════════
//  TIME TRACKER SERVICE
// ═══════════════════════════════════════════════════════════════════

export const timeService = {
    /** Log time spent on the app (in minutes) */
    logTime: (minutes) =>
        api.post('/time_log', { minutes }).then(r => r.data),
};


// ═══════════════════════════════════════════════════════════════════
//  ADMIN SERVICE
// ═══════════════════════════════════════════════════════════════════

export const adminService = {
    /** Get aggregated, anonymized system-wide stats */
    getInsights: () =>
        api.get('/admin/insights').then(r => r.data),
};


// ═══════════════════════════════════════════════════════════════════
//  ASSESSMENT SERVICE
// ═══════════════════════════════════════════════════════════════════

export const assessmentService = {
    /** Save assessment results to the backend */
    saveResult: (score, answers) =>
        api.post('/assessment', { score, answers }).then(r => r.data),
};
