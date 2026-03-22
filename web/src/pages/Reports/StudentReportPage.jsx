import { useState } from 'react'
import { Card, CardBody, CardHeader, Select, Loading } from '../../components/Common'
import DataTable from '../../components/Common/DataTable'
import { useStudentReport, useUsers } from '../../api/hooks'
import './Reports.css'

export default function StudentReportPage() {
  const [selectedStudentId, setSelectedStudentId] = useState('')

  const { data: usersData } = useUsers({ role: 'student' })
  const students = usersData?.data || []

  const { data: reportData, isLoading } = useStudentReport(selectedStudentId)
  const report = reportData?.data || {}

  const columns = [
    { key: 'course_name', header: 'Course' },
    { key: 'total_classes', header: 'Total Classes' },
    { key: 'attended', header: 'Attended' },
    { key: 'attendance_rate', header: 'Attendance %', render: (val) => `${(val || 0).toFixed(2)}%` },
  ]

  const tableData = report.courses || []

  return (
    <div className="page-inner">
      <div className="page-header">
        <div>
          <h1 className="page-title">Student Report</h1>
          <p className="page-subtitle">Individual student attendance details</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <Select
              label="Select Student"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
            >
              <option value="">— Select a student —</option>
              {Array.isArray(students) && students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.username} ({student.email})
                </option>
              ))}
            </Select>
          </div>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <Loading />
          ) : selectedStudentId && report.student ? (
            <>
              <div style={{ marginBottom: '16px', padding: '14px 16px', background: 'var(--bg-surface)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                <strong style={{ fontSize: 14 }}>{report.student.username}</strong>
                <span style={{ marginLeft: 12, fontSize: 13, color: 'var(--ink-500)' }}>{report.student.email}</span>
              </div>
              {tableData.length > 0 ? (
                <DataTable columns={columns} data={tableData} searchable={false} />
              ) : (
                <p style={{ color: 'var(--ink-500)', textAlign: 'center', padding: '40px' }}>No attendance data available for this student</p>
              )}
            </>
          ) : (
            <p style={{ color: 'var(--ink-500)', textAlign: 'center', padding: '40px' }}>Select a student to view their attendance report</p>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
