import { Card, CardBody } from '../../components/Common'
import './Management.css'

export default function EnrollmentsPage() {
  return (
    <div className="management">
      <div className="management__header">
        <div>
          <h1>Enrollments Management</h1>
          <p>Manage student enrollments in courses</p>
        </div>
      </div>
      <Card>
        <CardBody>
          <p>Enrollments management page</p>
        </CardBody>
      </Card>
    </div>
  )
}
