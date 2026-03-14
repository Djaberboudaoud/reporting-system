import axios from "axios";

const API_BASE_URL = "https://backfast.vercel.app/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ============ AUTH ============
export const authAPI = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  register: (data: any) => api.post("/auth/register", data),
  getMe: () => api.get("/auth/me"),
};

// ============ COMPANIES ============
export const companiesAPI = {
  getAll: () => api.get("/companies/"),
  getById: (id: number) => api.get(`/companies/${id}`),
  create: (data: any) => api.post("/companies/", data),
  update: (id: number, data: any) => api.put(`/companies/${id}`, data),
  delete: (id: number) => api.delete(`/companies/${id}`),
};

// ============ UNITS ============
export const unitsAPI = {
  getAll: (companyId?: number) =>
    api.get("/units/", { params: companyId ? { company_id: companyId } : {} }),
  getById: (id: number) => api.get(`/units/${id}`),
  create: (data: any) => api.post("/units/", data),
  update: (id: number, data: any) => api.put(`/units/${id}`, data),
  delete: (id: number) => api.delete(`/units/${id}`),
};

// ============ USERS ============
export const usersAPI = {
  getAll: () => api.get("/users/"),
  getById: (id: number) => api.get(`/users/${id}`),
  create: (data: any) => api.post("/users/", data),
  update: (id: number, data: any) => api.put(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
};

// ============ LOCATIONS ============
export const locationsAPI = {
  getAll: () => api.get("/locations/"),
  getById: (id: number) => api.get(`/locations/${id}`),
  create: (data: any) => api.post("/locations/", data),
  update: (id: number, data: any) => api.put(`/locations/${id}`, data),
  delete: (id: number) => api.delete(`/locations/${id}`),
};

// ============ CASE CATEGORIES ============
export const caseCategoriesAPI = {
  getAll: () => api.get("/case-categories/"),
  getById: (id: number) => api.get(`/case-categories/${id}`),
  create: (data: any) => api.post("/case-categories/", data),
  update: (id: number, data: any) => api.put(`/case-categories/${id}`, data),
  delete: (id: number) => api.delete(`/case-categories/${id}`),
};

// ============ CASE TYPES ============
export const caseTypesAPI = {
  getAll: (categoryId?: number) =>
    api.get("/case-types/", {
      params: categoryId ? { category_id: categoryId } : {},
    }),
  getById: (id: number) => api.get(`/case-types/${id}`),
  create: (data: any) => api.post("/case-types/", data),
  update: (id: number, data: any) => api.put(`/case-types/${id}`, data),
  delete: (id: number) => api.delete(`/case-types/${id}`),
};

// ============ CASES ============
export const casesAPI = {
  getAll: (filters?: Record<string, any>) =>
    api.get("/cases/", { params: filters }),
  getById: (id: number) => api.get(`/cases/${id}`),
  create: (data: any) => api.post("/cases/", data),
  update: (id: number, data: any) => api.put(`/cases/${id}`, data),
  delete: (id: number) => api.delete(`/cases/${id}`),
};

// ============ SAVED SEARCHES ============
export const savedSearchesAPI = {
  getByUser: (userId: number) => api.get(`/saved-searches/${userId}`),
  create: (data: any) => api.post("/saved-searches/", data),
  delete: (id: number) => api.delete(`/saved-searches/${id}`),
};

// ============ NOTIFICATIONS ============
export const notificationsAPI = {
  getByUser: (userId: number) => api.get(`/notifications/${userId}`),
  getUnreadCount: (userId: number) =>
    api.get(`/notifications/${userId}/unread-count`),
  create: (data: any) => api.post("/notifications/", data),
  markAsRead: (id: number) => api.put(`/notifications/${id}/read`),
  markAllRead: (userId: number) => api.put(`/notifications/${userId}/read-all`),
  delete: (id: number) => api.delete(`/notifications/${id}`),
};

// ============ PERMISSIONS ============
export const permissionsAPI = {
  getByUser: (userId: number) => api.get(`/permissions/${userId}`),
  create: (data: any) => api.post("/permissions/", data),
  delete: (id: number) => api.delete(`/permissions/${id}`),
};

// ============ DASHBOARD ============
export const dashboardAPI = {
  getStats: () => api.get("/dashboard/stats"),
};

export default api;
