import { Card, CardBody } from '../../components/Common'
import './Reports.css'

export default function ClassReportPage() {
  return (
    <div className="reports">
      <div className="reports__header">
        <h1>Class Report</h1>
        <p>Class-wide attendance statistics</p>
      </div>
      <Card>
        <CardBody>
          <p>Class report page</p>
        </CardBody>
      </Card>
    </div>
  )
}
