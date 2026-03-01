// services.js - High-level API service functions
import apiClient from './client'

// User Services
export const updateUser = async (userId, data) => {
  const response = await apiClient.put(`/users/${userId}`, data)
  return response.data
}

export const updateUserPassword = async (userId, data) => {
  const response = await apiClient.put(`/users/${userId}`, {
    ...data,
    _password_update: true, // Flag to indicate this is a password update
  })
  return response.data
}

export const getUser = async (userId) => {
  const response = await apiClient.get(`/users/${userId}`)
  return response.data
}

export const getCurrentUser = async () => {
  const response = await apiClient.get('/auth/me')
  return response.data
}

export const listUsers = async (params) => {
  const response = await apiClient.get('/users/', { params })
  return response.data
}

export const createUser = async (data) => {
  const response = await apiClient.post('/users/', data)
  return response.data
}

export const deleteUser = async (userId) => {
  const response = await apiClient.delete(`/users/${userId}`)
  return response.data
}

// Attendance Services
export const markAttendance = async (data) => {
  const response = await apiClient.post('/attendance/mark', data)
  return response.data
}

export const getAttendanceHistory = async (userId, params) => {
  const response = await apiClient.get(`/attendance/history/${userId}`, { params })
  return response.data
}

export const getSessionAttendance = async (timetableId, params) => {
  const response = await apiClient.get(`/attendance/session/${timetableId}`, { params })
  return response.data
}

// QR Code Services
export const generateQRCode = async (timetableId, params) => {
  const response = await apiClient.post(`/qr/generate/${timetableId}`, {}, { params })
  return response.data
}

export const getCurrentQRCode = async (timetableId, params) => {
  const response = await apiClient.get(`/qr/current/${timetableId}`, { params })
  return response.data
}

export const refreshQRCode = async (timetableId) => {
  const response = await apiClient.post(`/qr/refresh/${timetableId}`)
  return response.data
}

// OTP Services
export const generateOTP = async (timetableId, params) => {
  const response = await apiClient.post(`/otp/generate/${timetableId}`, {}, { params })
  return response.data
}

export const getCurrentOTP = async (timetableId) => {
  const response = await apiClient.get(`/otp/current/${timetableId}`)
  return response.data
}

export const refreshOTP = async (timetableId) => {
  const response = await apiClient.post(`/otp/refresh/${timetableId}`)
  return response.data
}

// Report Services
export const getAttendanceSummary = async (params) => {
  const response = await apiClient.get('/reports/attendance-summary', { params })
  return response.data
}

export const getStudentReport = async (userId, params) => {
  const response = await apiClient.get(`/reports/student/${userId}`, { params })
  return response.data
}

export const getClassReport = async (timetableId, params) => {
  const response = await apiClient.get(`/reports/class/${timetableId}`, { params })
  return response.data
}

export const exportReportsCSV = async (params) => {
  const response = await apiClient.get('/reports/export/csv', {
    params,
    responseType: 'blob',
  })
  return response.data
}

// Location/Division/Course/Branch/Batch/Enrollment Services
export const listLocations = async (params) => {
  const response = await apiClient.get('/locations', { params })
  return response.data
}

export const createLocation = async (data) => {
  const response = await apiClient.post('/locations', data)
  return response.data
}

export const updateLocation = async (locationId, data) => {
  const response = await apiClient.put(`/locations/${locationId}`, data)
  return response.data
}

export const deleteLocation = async (locationId) => {
  const response = await apiClient.delete(`/locations/${locationId}`)
  return response.data
}

export const listDivisions = async (params) => {
  const response = await apiClient.get('/divisions', { params })
  return response.data
}

export const createDivision = async (data) => {
  const response = await apiClient.post('/divisions', data)
  return response.data
}

export const updateDivision = async (divisionId, data) => {
  const response = await apiClient.put(`/divisions/${divisionId}`, data)
  return response.data
}

export const deleteDivision = async (divisionId) => {
  const response = await apiClient.delete(`/divisions/${divisionId}`)
  return response.data
}

export const listTimetables = async (params) => {
  const response = await apiClient.get('/timetables', { params })
  return response.data
}

export const createTimetable = async (data) => {
  const response = await apiClient.post('/timetables', data)
  return response.data
}

export const updateTimetable = async (timetableId, data) => {
  const response = await apiClient.put(`/timetables/${timetableId}`, data)
  return response.data
}

export const deleteTimetable = async (timetableId) => {
  const response = await apiClient.delete(`/timetables/${timetableId}`)
  return response.data
}

export const listCourses = async (params) => {
  const response = await apiClient.get('/courses', { params })
  return response.data
}

export const createCourse = async (data) => {
  const response = await apiClient.post('/courses', data)
  return response.data
}

export const updateCourse = async (courseId, data) => {
  const response = await apiClient.put(`/courses/${courseId}`, data)
  return response.data
}

export const deleteCourse = async (courseId) => {
  const response = await apiClient.delete(`/courses/${courseId}`)
  return response.data
}

export const listBranches = async (params) => {
  const response = await apiClient.get('/branches', { params })
  return response.data
}

export const createBranch = async (data) => {
  const response = await apiClient.post('/branches', data)
  return response.data
}

export const updateBranch = async (branchId, data) => {
  const response = await apiClient.put(`/branches/${branchId}`, data)
  return response.data
}

export const deleteBranch = async (branchId) => {
  const response = await apiClient.delete(`/branches/${branchId}`)
  return response.data
}

export const listBatches = async (params) => {
  const response = await apiClient.get('/batches', { params })
  return response.data
}

export const createBatch = async (data) => {
  const response = await apiClient.post('/batches', data)
  return response.data
}

export const updateBatch = async (batchId, data) => {
  const response = await apiClient.put(`/batches/${batchId}`, data)
  return response.data
}

export const deleteBatch = async (batchId) => {
  const response = await apiClient.delete(`/batches/${batchId}`)
  return response.data
}

export const listEnrollments = async (params) => {
  const response = await apiClient.get('/enrollments', { params })
  return response.data
}

export const createEnrollment = async (data) => {
  const response = await apiClient.post('/enrollments', data)
  return response.data
}

export const updateEnrollment = async (enrollmentId, data) => {
  const response = await apiClient.put(`/enrollments/${enrollmentId}`, data)
  return response.data
}

export const deleteEnrollment = async (enrollmentId) => {
  const response = await apiClient.delete(`/enrollments/${enrollmentId}`)
  return response.data
}

// Auth Services
export const login = async (username, password) => {
  const response = await apiClient.post('/auth/login', { username, password })
  return response.data
}

export const register = async (data) => {
  const response = await apiClient.post('/auth/register', data)
  return response.data
}

export const logout = async () => {
  const response = await apiClient.post('/auth/logout')
  return response.data
}

export const refreshToken = async (refreshToken) => {
  const response = await apiClient.post('/auth/refresh', { refresh_token: refreshToken })
  return response.data
}

export const forgotPassword = async (email) => {
  const response = await apiClient.post('/auth/forgot-password', { email })
  return response.data
}

export const resetPassword = async (token, newPassword) => {
  const response = await apiClient.post('/auth/reset-password', {
    token,
    new_password: newPassword,
  })
  return response.data
}
