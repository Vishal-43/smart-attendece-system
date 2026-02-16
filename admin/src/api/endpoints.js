import apiClient from './client'

// Authentication Endpoints
export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  logout: () => apiClient.post('/auth/logout'),
  refreshToken: (refreshToken) => apiClient.post('/auth/refresh-token', { refresh_token: refreshToken }),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) =>
    apiClient.post('/auth/reset-password', { token, new_password: newPassword }),
}

// Users Endpoints
export const usersAPI = {
  getMe: () => apiClient.get('/users/me'),
  updateMe: (data) => apiClient.put('/users/me', data),
  getUser: (id) => apiClient.get(`/users/${id}`),
  listUsers: (params) => apiClient.get('/users', { params }),
  createUser: (data) => apiClient.post('/users', data),
  updateUser: (id, data) => apiClient.put(`/users/${id}`, data),
  deleteUser: (id) => apiClient.delete(`/users/${id}`),
}

// Divisions Endpoints
export const divisionsAPI = {
  listDivisions: (params) => apiClient.get('/divisions', { params }),
  getDivision: (id) => apiClient.get(`/divisions/${id}`),
  createDivision: (data) => apiClient.post('/divisions', data),
  updateDivision: (id, data) => apiClient.put(`/divisions/${id}`, data),
  deleteDivision: (id) => apiClient.delete(`/divisions/${id}`),
  getDivisionStudents: (id) => apiClient.get(`/divisions/${id}/students`),
  getDivisionTimetable: (id) => apiClient.get(`/divisions/${id}/timetable`),
}

// Locations (Geo-fence) Endpoints
export const locationsAPI = {
  listLocations: (params) => apiClient.get('/locations', { params }),
  getLocation: (id) => apiClient.get(`/locations/${id}`),
  createLocation: (data) => apiClient.post('/locations', data),
  updateLocation: (id, data) => apiClient.put(`/locations/${id}`, data),
  deleteLocation: (id) => apiClient.delete(`/locations/${id}`),
  validatePoint: (latitude, longitude) =>
    apiClient.get('/locations/validate-point', {
      params: { lat: latitude, lon: longitude },
    }),
}

// Timetables Endpoints
export const timetablesAPI = {
  listTimetables: (params) => apiClient.get('/timetables', { params }),
  getTimetable: (id) => apiClient.get(`/timetables/${id}`),
  createTimetable: (data) => apiClient.post('/timetables', data),
  updateTimetable: (id, data) => apiClient.put(`/timetables/${id}`, data),
  deleteTimetable: (id) => apiClient.delete(`/timetables/${id}`),
  getMySchedule: () => apiClient.get('/timetables/my-schedule'),
  getTodayTimetable: () => apiClient.get('/timetables/today'),
}

// Courses Endpoints
export const coursesAPI = {
  listCourses: (params) => apiClient.get('/courses', { params }),
  getCourse: (id) => apiClient.get(`/courses/${id}`),
  createCourse: (data) => apiClient.post('/courses', data),
  updateCourse: (id, data) => apiClient.put(`/courses/${id}`, data),
  deleteCourse: (id) => apiClient.delete(`/courses/{id}`),
}

// Branches Endpoints
export const branchesAPI = {
  listBranches: (params) => apiClient.get('/branches', { params }),
  getBranch: (id) => apiClient.get(`/branches/${id}`),
  createBranch: (data) => apiClient.post('/branches', data),
  updateBranch: (id, data) => apiClient.put(`/branches/${id}`, data),
  deleteBranch: (id) => apiClient.delete(`/branches/${id}`),
}

// Batches Endpoints
export const batchesAPI = {
  listBatches: (params) => apiClient.get('/batches', { params }),
  getBatch: (id) => apiClient.get(`/batches/${id}`),
  createBatch: (data) => apiClient.post('/batches', data),
  updateBatch: (id, data) => apiClient.put(`/batches/${id}`, data),
  deleteBatch: (id) => apiClient.delete(`/batches/${id}`),
}

// Enrollments Endpoints
export const enrollmentsAPI = {
  listEnrollments: (params) => apiClient.get('/enrollments', { params }),
  getEnrollment: (id) => apiClient.get(`/enrollments/${id}`),
  createEnrollment: (data) => apiClient.post('/enrollments', data),
  updateEnrollment: (id, data) => apiClient.put(`/enrollments/${id}`, data),
  deleteEnrollment: (id) => apiClient.delete(`/enrollments/${id}`),
}

// Attendance Endpoints
export const attendanceAPI = {
  markAttendance: (data) => apiClient.post('/attendance/mark', data),
  getMyRecords: (params) => apiClient.get('/attendance/my-records', { params }),
  getRecords: (params) => apiClient.get('/attendance/records', { params }),
  getAnalytics: (params) => apiClient.get('/attendance/analytics', { params }),
}

// QR Code Endpoints
export const qrAPI = {
  getCurrent: (locationId) => apiClient.get(`/qr/current/${locationId}`),
  verify: (data) => apiClient.post('/qr/verify', data),
}

// OTP Endpoints
export const otpAPI = {
  request: (locationId) => apiClient.get(`/otp/request/${locationId}`),
  verify: (data) => apiClient.post('/otp/verify', data),
}

// Access Points Endpoints
export const accessPointsAPI = {
  listAccessPoints: (params) => apiClient.get('/access-points', { params }),
  createAccessPoint: (locationId, data) =>
    apiClient.post(`/access-points/${locationId}`, data),
  deleteAccessPoint: (id) => apiClient.delete(`/access-points/${id}`),
}

// Reports Endpoints
export const reportsAPI = {
  getAttendanceReport: (params) => apiClient.get('/reports/attendance', { params }),
  getStudentReport: (studentId) => apiClient.get(`/reports/student/${studentId}`),
  getClassReport: (classId) => apiClient.get(`/reports/class/${classId}`),
  exportCSV: (params) => apiClient.get('/reports/export/csv', { params, responseType: 'blob' }),
  exportPDF: (params) => apiClient.get('/reports/export/pdf', { params, responseType: 'blob' }),
}
