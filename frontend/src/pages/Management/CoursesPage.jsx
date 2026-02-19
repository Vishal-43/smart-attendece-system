import { Card, CardBody } from '../../components/Common'
import './Management.css'

export default function CoursesPage() {
  return (
    <div className="management">
      <div className="management__header">
        <div>
          <h1>Courses Management</h1>
          <p>Manage academic courses</p>
        </div>
      </div>
      <Card>
        <CardBody>
          <p>Courses management page</p>
        </CardBody>
      </Card>
    </div>
  )
}
