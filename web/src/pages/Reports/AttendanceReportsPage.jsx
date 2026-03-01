import { useState } from 'react'
import { Card, CardBody, CardHeader, Button, Input, Select, Loading } from '../../components/Common'
import DataTable from '../../components/Common/DataTable'
import { Download } from 'lucide-react'
import { useAttendanceSummary, useExportCSV, useDivisions } from '../../api/hooks'
import './Reports.css'

export default function AttendanceReportsPage() {
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    division_id: '',
  })
  const [enableQuery, setEnableQuery] = useState(false)

  const { data: divisionsData } = useDivisions()
  const divisions = divisionsData?.data?.data || divisionsData?.data || []

  const { data: reportData, isLoading } = useAttendanceSummary(filters, {
    enabled: enableQuery,
  })
  const exportMutation = useExportCSV()

  const report = reportData?.data?.data || reportData?.data || {}

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const handleGenerateReport = () => {
    setEnableQuery(true)
  }

  const handleExportCSV = () => {
    exportMutation.mutate(filters)
  }

  const columns = [
    { key: 'metric', header: 'Metric' },
    { key: 'value', header: 'Value' },
  ]

  const tableData = report.total !== undefined ? [
    { metric: 'Total Records', value: report.total || 0 },
    { metric: 'Present', value: report.present || 0 },
    { metric: 'Absent', value: report.absent || 0 },
    { metric: 'Late', value: report.late || 0 },
    { metric: 'Attendance Rate', value: `${(report.attendance_rate || 0).toFixed(2)}%` },
  ] : []

  return (
    <div className="reports">
      <div className="reports__header">
        <div>
          <h1>Attendance Reports</h1>
          <p>View and export attendance records</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="reports__filters">
            <Select
              label="Division"
              value={filters.division_id}
              onChange={(e) => handleFilterChange('division_id', e.target.value)}
            >
              <option value="">All Divisions</option>
              {Array.isArray(divisions) && divisions.map((div) => (
                <option key={div.id} value={div.id}>
                  {div.name}
                </option>
              ))}
            </Select>
            <Input 
              label="From Date" 
              type="date"
              value={filters.start_date}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
            />
            <Input 
              label="To Date" 
              type="date"
              value={filters.end_date}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
            />
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
              <Button variant="primary" onClick={handleGenerateReport}>
                Generate Report
              </Button>
              <Button 
                variant="secondary" 
                onClick={handleExportCSV}
                disabled={!enableQuery || exportMutation.isPending}
              >
                <Download size={16} />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <Loading />
          ) : enableQuery && tableData.length > 0 ? (
            <DataTable
              columns={columns}
              data={tableData}
              searchable={false}
            />
          ) : (
            <p>Select filters above and click "Generate Report" to view attendance summary</p>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
