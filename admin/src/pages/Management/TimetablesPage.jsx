import { Card, CardBody } from '../../components/Common'
import './Management.css'

export default function TimetablesPage() {
  return (
    <div className="management">
      <div className="management__header">
        <div>
          <h1>Timetables Management</h1>
          <p>Manage class schedules and timetables</p>
        </div>
      </div>
      <Card>
        <CardBody>
          <p>Timetables management page</p>
        </CardBody>
      </Card>
    </div>
  )
}
