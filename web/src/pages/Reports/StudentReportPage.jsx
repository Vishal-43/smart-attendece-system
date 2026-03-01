import { useState } from 'react'
import { Card, CardBody, CardHeader, Button, Select, Loading } from '../../components/Common'
import DataTable from '../../components/Common/DataTable'
import { useStudentReport, useUsers } from '../../api/hooks'
import './Reports.css'

export default function StudentReportPage() {
  const [selectedStudentId, setSelectedStudentId] = useState('')

  const { data: usersData } = useUsers({ role: 'STUDENT' })
  const students = usersData?.data?.data || usersData?.data?.items || []

  const { data: reportData, isLoading } = useStudentReport(selectedStudentId)
  const report = reportData?.data?.data || reportData?.data || {}

  const columns = [
    { key: 'course_name', header: 'Course' },
    { key: 'total_classes', header: 'Total Classes' },
    { key: 'attended', header: 'Attended' },
    { key: 'attendance_rate', header: 'Attendance %', render: (val) => `${(val || 0).toFixed(2)}%` },
  ]

  const tableData = report.courses || []

  return (
    <div className="reports">
      <div className="reports__header">
        <h1>Student Report</h1>
        <p>Individual student attendance details</p>
      </div>

      <Card>
        <CardHeader>
          <div className="reports__filters">
            <Select
              label="Select Student"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
            >
              <option value="">-- Select a student --</option>
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
              <div className="student-info" style={{ marginBottom: '2rem' }}>
                <h3>Student: {report.student.username}</h3>
                <p>Email: {report.student.email}</p>
              </div>
              {tableData.length > 0 ? (
                <DataTable
                  columns={columns}
                  data={tableData}
                  searchable={false}
                />
              ) : (
                <p>No attendance data available for this student</p>
              )}
            </>
          ) : (
            <p>Please select a student to view their attendance report</p>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
