const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function getToken() {
  return localStorage.getItem("hms_token");
}
export function setToken(token) {
  if (token) localStorage.setItem("hms_token", token);
  else localStorage.removeItem("hms_token");
}

export function getStoredUser() {
  const raw = localStorage.getItem("hms_user");
  return raw ? JSON.parse(raw) : null;
}
export function setStoredUser(user) {
  if (user) localStorage.setItem("hms_user", JSON.stringify(user));
  else localStorage.removeItem("hms_user");
}

// --- kept as aliases so any older code/components referencing "patient" still work ---
export const getStoredPatient = getStoredUser;
export const setStoredPatient = setStoredUser;

async function handle(res) {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.details || body.error || "Request failed");
  return body;
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function get(path) {
  return fetch(`${API_URL}${path}`, { headers: authHeaders() }).then(handle);
}
function post(path, payload) {
  return fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload || {}),
  }).then(handle);
}
function put(path, payload) {
  return fetch(`${API_URL}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload || {}),
  }).then(handle);
}
function del(path) {
  return fetch(`${API_URL}${path}`, { method: "DELETE", headers: authHeaders() }).then(handle);
}

// ---------- auth ----------
export const registerPatient = (payload) => post("/api/auth/register", payload);
export const login = (payload) => post("/api/auth/login", payload);
export const loginPatient = login; // alias for the existing AuthModal component
export const getMe = () => get("/api/auth/me");
export const changePassword = (payload) => post("/api/auth/change-password", payload);

// ---------- public site ----------
export const getDoctors = (department) =>
  get(department ? `/api/doctors?department=${encodeURIComponent(department)}` : "/api/doctors");
export const getDepartments = () => get("/api/departments");
export const getStats = () => get("/api/stats");

// ---------- appointments ----------
export const getBookedSlots = (doctorId, date) => get(`/api/appointments/booked-slots?doctorId=${doctorId}&date=${date}`);
export const bookAppointment = (payload) => post("/api/appointments", payload);
export const getMyAppointments = () => get("/api/appointments/mine");
export const cancelAppointment = (id) => del(`/api/appointments/${id}`);
export const getQueue = (date) => get(`/api/appointments/queue${date ? `?date=${date}` : ""}`);
export const getPatientAppointments = (patientId) => get(`/api/appointments/patient/${patientId}`);
export const updateConsultation = (id, payload) => put(`/api/appointments/${id}/consult`, payload);

// ---------- patients / medical history ----------
export const searchPatients = (q) => get(`/api/patients${q ? `?q=${encodeURIComponent(q)}` : ""}`);
export const getPatientById = (id) => get(`/api/patients/${id}`);
export const getMyProfile = () => get("/api/patients/me");
export const updateMyProfile = (payload) => put("/api/patients/me", payload);
export const getPatientHistory = (patientId) => get(`/api/patients/${patientId}/history`);
export const addMedicalHistory = (patientId, payload) => post(`/api/patients/${patientId}/history`, payload);

// ---------- prescriptions ----------
export const getMyPrescriptions = () => get("/api/prescriptions/mine");
export const getPatientPrescriptions = (patientId) => get(`/api/prescriptions/patient/${patientId}`);
export const createPrescription = (payload) => post("/api/prescriptions", payload);

// ---------- lab reports ----------
export const getMyLabReports = () => get("/api/lab-reports/mine");
export const getPatientLabReports = (patientId) => get(`/api/lab-reports/patient/${patientId}`);
export const orderLabReport = (payload) => post("/api/lab-reports", payload);
export const updateLabReport = (id, payload) => put(`/api/lab-reports/${id}`, payload);

// ---------- billing ----------
export const getMyBills = () => get("/api/billing/mine");
export const getBills = (status) => get(`/api/billing${status ? `?status=${status}` : ""}`);
export const createBill = (payload) => post("/api/billing", payload);
export const payBill = (id, amount) => put(`/api/billing/${id}/pay`, { amount });

// ---------- beds ----------
export const getBeds = () => get("/api/beds");
export const addBed = (payload) => post("/api/beds", payload);
export const updateBed = (id, payload) => put(`/api/beds/${id}`, payload);

// ---------- admin: staff/user management ----------
export const listUsers = (role) => get(`/api/admin/users${role ? `?role=${role}` : ""}`);
export const createStaff = (payload) => post("/api/admin/users", payload);
export const updateUser = (id, payload) => put(`/api/admin/users/${id}`, payload);
export const resetUserPassword = (id) => post(`/api/admin/users/${id}/reset-password`);

// ---------- analytics ----------
export const getDashboardStats = () => get("/api/stats/dashboard");

// ---------- audit logs ----------
export const getAuditLogs = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return get(`/api/audit-logs${qs ? `?${qs}` : ""}`);
};
