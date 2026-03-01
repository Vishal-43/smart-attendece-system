import { Card, CardBody } from '../../components/Common'
import './Reports.css'

export default function StudentReportPage() {
  return (
    <div className="reports">
      <div className="reports__header">
        <h1>Student Report</h1>
        <p>Individual student attendance details</p>
      </div>
      <Card>
        <CardBody>
          <p>Student report page</p>
        </CardBody>
      </Card>
    </div>
  )
}
