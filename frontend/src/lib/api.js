import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' },
});

// Interceptor to add token
api.interceptors.request.use(config => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('nailflow_token') : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Services
export const getServices = () => api.get('/api/services').then(r => r.data);

// Staff
export const getStaffBySlug = (slug) => api.get(`/api/staff/${slug}`).then(r => r.data);
export const getAllStaff = () => api.get('/api/staff').then(r => r.data);

// Availability
export const getAvailability = (date, staffId) =>
    api.get('/api/booking/availability', { params: { date, staff_id: staffId } }).then(r => r.data);

// Booking
export const createBooking = (data) => api.post('/api/booking/create', data).then(r => r.data);
export const getBooking = (id) => api.get(`/api/booking/${id}`).then(r => r.data);

// Payment
export const processPayment = (data) => api.post('/api/payment/process', data).then(r => r.data);

// Reference Images
export const uploadReferenceImages = (bookingId, files) => {
    const form = new FormData();
    form.append('booking_id', bookingId);
    files.forEach(file => form.append('images', file));
    return axios.post(`${API_URL}/api/reference-images/upload`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
    }).then(r => r.data);
};

// Dashboard
export const getDashboardBookings = (params) =>
    api.get('/api/dashboard/bookings', { params }).then(r => r.data);
export const getDashboardStats = () => api.get('/api/dashboard/stats').then(r => r.data);
export const getDashboardServices = () => api.get('/api/dashboard/services').then(r => r.data);
export const createService = (data) => api.post('/api/dashboard/services/create', data).then(r => r.data);
export const updateService = (data) => api.put('/api/dashboard/services/update', data).then(r => r.data);
export const deleteService = (id) => api.delete('/api/dashboard/services/delete', { data: { id } }).then(r => r.data);
export const getDashboardStaff = () => api.get('/api/dashboard/staff').then(r => r.data);
export const createStaff = (data) => api.post('/api/dashboard/staff/create', data).then(r => r.data);
export const updateStaff = (data) => api.put('/api/dashboard/staff/update', data).then(r => r.data);
export const deleteStaff = (id) => api.delete('/api/dashboard/staff/delete', { data: { id } }).then(r => r.data);
export const getSettings = () => api.get('/api/dashboard/settings').then(r => r.data);
export const updateSettings = (data) => api.put('/api/dashboard/settings/update', data).then(r => r.data);
export const getPayments = () => api.get('/api/dashboard/payments').then(r => r.data);

export default api;
