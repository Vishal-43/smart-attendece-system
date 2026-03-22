import { useState } from 'react'
import { Card, CardHeader, CardBody, Button, Loading } from '../../components/Common'
import DataTable from '../../components/Common/DataTable'
import { Download, FileText, Filter, Calendar, Building } from 'lucide-react'
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

  const { data: reportData, isLoading } = useAttendanceSummary(filters, { enabled: enableQuery })
  const exportMutation = useExportCSV()

  const report = reportData?.data?.data || reportData?.data || reportData || {}

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const handleGenerateReport = () => { setEnableQuery(true) }

  const handleExportCSV = () => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
    )
    exportMutation.mutate(cleanFilters)
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
    <div className="page-inner">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FileText size={24} style={{ color: 'var(--primary-600)' }} />
            Attendance Reports
          </h1>
          <p className="page-subtitle">View and export attendance records</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Filter size={18} style={{ color: 'var(--ink-hint)' }} />
            <span style={{ fontWeight: 600, fontSize: '15px' }}>Filters</span>
          </div>
        </CardHeader>
        <CardBody>
          <div className="reports__filters">
            <div className="form-group" style={{ minWidth: '200px' }}>
              <label className="form-group__label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building size={14} />
                Division
              </label>
              <select
                value={filters.division_id}
                onChange={(e) => handleFilterChange('division_id', e.target.value)}
                className="select"
              >
                <option value="">All Divisions</option>
                {Array.isArray(divisions) && divisions.map((div) => (
                  <option key={div.id} value={div.id}>{div.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ minWidth: '180px' }}>
              <label className="form-group__label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} />
                From Date
              </label>
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) => handleFilterChange('start_date', e.target.value)}
                className="input"
              />
            </div>
            <div className="form-group" style={{ minWidth: '180px' }}>
              <label className="form-group__label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} />
                To Date
              </label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange('end_date', e.target.value)}
                className="input"
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', paddingBottom: '4px' }}>
              <Button variant="primary" onClick={handleGenerateReport}>
                Generate Report
              </Button>
              <Button variant="secondary" onClick={handleExportCSV} disabled={!enableQuery || exportMutation.isPending}>
                <Download size={16} />
                Export CSV
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {isLoading ? (
        <Card style={{ marginTop: '24px' }}>
          <CardBody>
            <Loading />
          </CardBody>
        </Card>
      ) : enableQuery && tableData.length > 0 ? (
        <Card style={{ marginTop: '24px' }}>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--r-lg)',
                background: 'var(--green-bg)',
                display: 'grid',
                placeItems: 'center',
                color: 'var(--green-text)'
              }}>
                <FileText size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Report Summary</h3>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-hint)' }}>
                  {filters.start_date && filters.end_date 
                    ? `${filters.start_date} to ${filters.end_date}` 
                    : 'All time'}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <DataTable columns={columns} data={tableData} searchable={false} />
          </CardBody>
        </Card>
      ) : (
        <Card style={{ marginTop: '24px' }}>
          <CardBody>
            <div className="empty-state">
              <div className="empty-state__icon">
                <FileText size={32} />
              </div>
              <h3 className="empty-state__title">No Report Generated</h3>
              <p className="empty-state__description">
                Select filters and click "Generate Report" to view attendance data
              </p>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
