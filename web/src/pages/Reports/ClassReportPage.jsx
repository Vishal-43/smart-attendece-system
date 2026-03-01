import { useState } from 'react'
import { Card, CardBody, CardHeader, Select, Input, Loading } from '../../components/Common'
import DataTable from '../../components/Common/DataTable'
import { useClassReport, useTimetables } from '../../api/hooks'
import './Reports.css'

export default function ClassReportPage() {
  const [selectedTimetableId, setSelectedTimetableId] = useState('')
  const [sessionDate, setSessionDate] = useState('')

  const { data: timetablesData } = useTimetables()
  const timetables = timetablesData?.data?.data || timetablesData?.data || []

  const { data: reportData, isLoading } = useClassReport(
    selectedTimetableId,
    sessionDate ? { session_date: sessionDate } : {}
  )
  const report = reportData?.data?.data || reportData?.data || {}

  const columns = [
    { key: 'student_name', header: 'Student Name' },
    { key: 'student_email', header: 'Email' },
    { key: 'status', header: 'Status', render: (val) => val || 'Not Marked' },
    { key: 'marked_at', header: 'Marked At', render: (val) => val ? new Date(val).toLocaleString() : '-' },
  ]

  const tableData = report.students || []

  return (
    <div className="reports">
      <div className="reports__header">
        <h1>Class Report</h1>
        <p>Class-wide attendance statistics</p>
      </div>

      <Card>
        <CardHeader>
          <div className="reports__filters">
            <Select
              label="Select Timetable"
              value={selectedTimetableId}
              onChange={(e) => setSelectedTimetableId(e.target.value)}
            >
              <option value="">-- Select a timetable --</option>
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
              <div className="class-summary" style={{ marginBottom: '2rem', display: 'flex', gap: '2rem' }}>
                <div>
                  <strong>Total Students:</strong> {report.total_students}
                </div>
                <div>
                  <strong>Attended:</strong> {report.attended}
                </div>
                <div>
                  <strong>Attendance %:</strong> {(report.attendance_percentage || 0).toFixed(2)}%
                </div>
              </div>
              {tableData.length > 0 ? (
                <DataTable
                  columns={columns}
                  data={tableData}
                  searchable={true}
                />
              ) : (
                <p>No student data available for this class session</p>
              )}
            </>
          ) : (
            <p>Please select a timetable to view class attendance report</p>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
