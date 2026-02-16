import { Card, CardBody, CardHeader, Button, Input, Select } from '../../components/Common'
import { Download, FileText } from 'lucide-react'
import './Reports.css'

export default function AttendanceReportsPage() {
  const handleExportCSV = () => {
    // Export logic
  }

  const handleExportPDF = () => {
    // Export logic
  }

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
              options={[
                { label: 'All Divisions', value: '' },
                { label: 'Division A', value: 'a' },
              ]}
            />
            <Input label="From Date" type="date" />
            <Input label="To Date" type="date" />
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
              <Button variant="primary">Generate Report</Button>
              <Button variant="secondary" onClick={handleExportCSV}>
                <Download size={16} />
                CSV
              </Button>
              <Button variant="secondary" onClick={handleExportPDF}>
                <FileText size={16} />
                PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <p>Select filters above to generate attendance report</p>
        </CardBody>
      </Card>
    </div>
  )
}
