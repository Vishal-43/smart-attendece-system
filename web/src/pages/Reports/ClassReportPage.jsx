import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Card, CardBody, CardHeader, Select, Input, Loading } from '../../components/Common'
import DataTable from '../../components/Common/DataTable'
import { useClassReport, useTimetables } from '../../api/hooks'
import { realtimeAPI } from '../../api/endpoints'
import './Reports.css'

export default function ClassReportPage() {
  const queryClient = useQueryClient()
  const [selectedTimetableId, setSelectedTimetableId] = useState('')
  const [sessionDate, setSessionDate] = useState('')

  const { data: timetablesData } = useTimetables()
  const timetables = timetablesData?.data || []

  const { data: reportData, isLoading } = useClassReport(
    selectedTimetableId,
    sessionDate ? { session_date: sessionDate } : {}
  )
  const report = reportData?.data || {}

  const columns = [
    { key: 'student_name', header: 'Student Name' },
    { key: 'student_email', header: 'Email' },
    { key: 'status', header: 'Status', render: (val) => val || 'Not Marked' },
    { key: 'marked_at', header: 'Marked At', render: (val) => val ? new Date(val).toLocaleString() : '—' },
  ]

  const tableData = report.students || []

  useEffect(() => {
    if (!selectedTimetableId) return undefined

    const socket = new WebSocket(realtimeAPI.attendanceSocketUrl(selectedTimetableId))
    const ping = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) socket.send('ping')
    }, 15000)

    socket.onmessage = () => {
      queryClient.invalidateQueries({ queryKey: ['reports', 'class', selectedTimetableId] })
    }

    return () => { clearInterval(ping); socket.close() }
  }, [selectedTimetableId, queryClient])

  return (
    <div className="page-inner">
      <div className="page-header">
        <div>
          <h1 className="page-title">Class Report</h1>
          <p className="page-subtitle">Class-wide attendance statistics</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="reports__filters">
            <Select
              label="Select Timetable"
              value={selectedTimetableId}
              onChange={(e) => setSelectedTimetableId(e.target.value)}
            >
              <option value="">— Select a timetable —</option>
              {Array.isArray(timetables) && timetables.map((tt) => (
                <option key={tt.id} value={tt.id}>
                  {tt.subject} - {tt.day_of_week} {tt.start_time}
                </option>
              ))}
            </Select>
            <Input
              label="Session Date (Optional)"
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <Loading />
          ) : selectedTimetableId && report.total_students !== undefined ? (
            <>
              <div style={{ display: 'flex', gap: '24px', marginBottom: '16px', padding: '14px 16px', background: 'var(--bg-surface)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                <div><strong>Total Students:</strong> <span style={{ marginLeft: 6 }}>{report.total_students}</span></div>
                <div><strong>Attended:</strong> <span style={{ marginLeft: 6 }}>{report.attended_count || 0}</span></div>
                <div><strong>Attendance %:</strong> <span style={{ marginLeft: 6 }}>{(report.attendance_percentage || 0).toFixed(2)}%</span></div>
              </div>
              {tableData.length > 0 ? (
                <DataTable columns={columns} data={tableData} searchable={true} />
              ) : (
                <p style={{ color: 'var(--ink-500)', textAlign: 'center', padding: '40px' }}>No student data available for this class session</p>
              )}
            </>
          ) : (
            <p style={{ color: 'var(--ink-500)', textAlign: 'center', padding: '40px' }}>Select a timetable to view class attendance report</p>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
