import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from './endpoints'
import toast from 'react-hot-toast'

// Auth Hooks
export const useLogin = () => {
  return useMutation({
    mutationFn: (credentials) => api.authAPI.login(credentials),
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Login failed')
    },
  })
}

export const useRegister = () => {
  return useMutation({
    mutationFn: (data) => api.authAPI.register(data),
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Registration failed')
    },
  })
}

export const useLogout = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.authAPI.logout(),
    onSuccess: () => {
      queryClient.clear()
    },
  })
}

// Users Hooks
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => api.authAPI.getMe(),
    retry: 1,
  })
}

export const useUsers = (params = {}) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => api.usersAPI.listUsers(params),
  })
}

export const useCreateUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.usersAPI.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User created successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to create user')
    },
  })
}

export const useUpdateUser = (id) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.usersAPI.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User updated successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to update user')
    },
  })
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.usersAPI.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to delete user')
    },
  })
}

// Divisions Hooks
export const useDivisions = (params = {}) => {
  return useQuery({
    queryKey: ['divisions', params],
    queryFn: () => api.divisionsAPI.listDivisions(params),
  })
}

export const useDivision = (id) => {
  return useQuery({
    queryKey: ['divisions', id],
    queryFn: () => api.divisionsAPI.getDivision(id),
    enabled: !!id,
  })
}

export const useCreateDivision = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.divisionsAPI.createDivision(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['divisions'] })
      toast.success('Division created successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to create division')
    },
  })
}

export const useUpdateDivision = (id) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.divisionsAPI.updateDivision(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['divisions'] })
      toast.success('Division updated successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to update division')
    },
  })
}

export const useDeleteDivision = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.divisionsAPI.deleteDivision(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['divisions'] })
      toast.success('Division deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to delete division')
    },
  })
}

// Locations Hooks
export const useLocations = (params = {}) => {
  return useQuery({
    queryKey: ['locations', params],
    queryFn: () => api.locationsAPI.listLocations(params),
  })
}

export const useLocation = (id) => {
  return useQuery({
    queryKey: ['locations', id],
    queryFn: () => api.locationsAPI.getLocation(id),
    enabled: !!id,
  })
}

export const useCreateLocation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.locationsAPI.createLocation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      toast.success('Location created successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to create location')
    },
  })
}

export const useUpdateLocation = (id) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.locationsAPI.updateLocation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      toast.success('Location updated successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to update location')
    },
  })
}

export const useDeleteLocation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.locationsAPI.deleteLocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      toast.success('Location deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to delete location')
    },
  })
}

// Timetables Hooks
export const useTimetables = (params = {}) => {
  return useQuery({
    queryKey: ['timetables', params],
    queryFn: () => api.timetablesAPI.listTimetables(params),
  })
}

export const useTimetable = (id) => {
  return useQuery({
    queryKey: ['timetables', id],
    queryFn: () => api.timetablesAPI.getTimetable(id),
    enabled: !!id,
  })
}

export const useCreateTimetable = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.timetablesAPI.createTimetable(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetables'] })
      toast.success('Timetable created successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to create timetable')
    },
  })
}

export const useUpdateTimetable = (id) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.timetablesAPI.updateTimetable(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetables'] })
      toast.success('Timetable updated successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to update timetable')
    },
  })
}

export const useDeleteTimetable = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.timetablesAPI.deleteTimetable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetables'] })
      toast.success('Timetable deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to delete timetable')
    },
  })
}

// Attendance Hooks
export const useAttendanceReport = (params = {}) => {
  return useQuery({
    queryKey: ['attendance', 'report', params],
    queryFn: () => api.attendanceAPI.getRecords(params),
  })
}

// Courses Hooks
export const useCourses = (params = {}) => {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: () => api.coursesAPI.listCourses(params),
  })
}

export const useCreateCourse = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.coursesAPI.createCourse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      toast.success('Course created successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to create course')
    },
  })
}

// Branches Hooks
export const useBranches = (params = {}) => {
  return useQuery({
    queryKey: ['branches', params],
    queryFn: () => api.branchesAPI.listBranches(params),
  })
}

export const useCreateBranch = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.branchesAPI.createBranch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] })
      toast.success('Branch created successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to create branch')
    },
  })
}

// Batches Hooks
export const useBatches = (params = {}) => {
  return useQuery({
    queryKey: ['batches', params],
    queryFn: () => api.batchesAPI.listBatches(params),
  })
}

export const useCreateBatch = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.batchesAPI.createBatch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] })
      toast.success('Batch created successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to create batch')
    },
  })
}

// Enrollments Hooks
export const useEnrollments = (params = {}) => {
  return useQuery({
    queryKey: ['enrollments', params],
    queryFn: () => api.enrollmentsAPI.listEnrollments(params),
  })
}

export const useCreateEnrollment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.enrollmentsAPI.createEnrollment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] })
      toast.success('Enrollment created successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to create enrollment')
    },
  })
}
// Reports Hooks
export const useAttendanceSummary = (params = {}) => {
  return useQuery({
    queryKey: ['reports', 'attendance-summary', params],
    queryFn: () => api.reportsAPI.getAttendanceSummary(params),
  })
}

export const useStudentReport = (studentId) => {
  return useQuery({
    queryKey: ['reports', 'student', studentId],
    queryFn: () => api.reportsAPI.getStudentReport(studentId),
    enabled: !!studentId,
  })
}

export const useClassReport = (timetableId, params = {}) => {
  return useQuery({
    queryKey: ['reports', 'class', timetableId, params],
    queryFn: () => api.reportsAPI.getClassReport(timetableId, params),
    enabled: !!timetableId,
  })
}

export const useExportCSV = () => {
  return useMutation({
    mutationFn: (params) => api.reportsAPI.exportCSV(params),
    onSuccess: (response) => {
      // Create download link for CSV blob
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `attendance_report_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Report exported successfully')
    },
    onError: (error) => {
      toast.error('Failed to export report')
    },
  })
}

// QR Code Hooks
export const useGenerateQR = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ timetableId, ttl_minutes = 10 }) => api.qrAPI.generate(timetableId, { ttl_minutes }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['qr', variables.timetableId] })
      toast.success('QR Code generated successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to generate QR code')
    },
  })
}

export const useCurrentQR = (timetableId, withImage = true) => {
  return useQuery({
    queryKey: ['qr', timetableId],
    queryFn: () => api.qrAPI.getCurrent(timetableId, { with_image: withImage }),
    enabled: !!timetableId,
    retry: false,
  })
}

export const useRefreshQR = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (timetableId) => api.qrAPI.refresh(timetableId),
    onSuccess: (_, timetableId) => {
      queryClient.invalidateQueries({ queryKey: ['qr', timetableId] })
      toast.success('QR Code refreshed')
    },
    onError: (error) => {
      toast.error('Failed to refresh QR code')
    },
  })
}

// OTP Hooks
export const useGenerateOTP = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ timetableId, ttl_minutes = 5 }) => api.otpAPI.generate(timetableId, { ttl_minutes }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['otp', variables.timetableId] })
      toast.success('OTP generated successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to generate OTP')
    },
  })
}

export const useCurrentOTP = (timetableId) => {
  return useQuery({
    queryKey: ['otp', timetableId],
    queryFn: () => api.otpAPI.getCurrent(timetableId),
    enabled: !!timetableId,
    retry: false,
  })
}

export const useRefreshOTP = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (timetableId) => api.otpAPI.refresh(timetableId),
    onSuccess: (_, timetableId) => {
      queryClient.invalidateQueries({ queryKey: ['otp', timetableId] })
      toast.success('OTP refreshed')
    },
    onError: (error) => {
      toast.error('Failed to refresh OTP')
    },
  })
}

// Attendance Marking Hooks
export const useMarkAttendance = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.attendanceAPI.markAttendance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
      toast.success('Attendance marked successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to mark attendance')
    },
  })
}

export const useAttendanceHistory = (userId, params = {}) => {
  return useQuery({
    queryKey: ['attendance', 'history', userId, params],
    queryFn: () => api.attendanceAPI.getHistory(userId, params),
    enabled: !!userId,
  })
}

export const useSessionAttendance = (timetableId, params = {}) => {
  return useQuery({
    queryKey: ['attendance', 'session', timetableId, params],
    queryFn: () => api.attendanceAPI.getSession(timetableId, params),
    enabled: !!timetableId,
  })
}

export const useUpdateAttendanceStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ attendanceId, status }) => api.attendanceAPI.updateStatus(attendanceId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
      toast.success('Attendance status updated')
    },
    onError: (error) => {
      toast.error('Failed to update attendance status')
    },
  })
}