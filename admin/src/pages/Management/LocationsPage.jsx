import { Card, CardBody } from '../../components/Common'
import './Management.css'

export default function LocationsPage() {
  return (
    <div className="management">
      <div className="management__header">
        <div>
          <h1>Locations Management</h1>
          <p>Manage geofences and attendance locations</p>
        </div>
      </div>
      <Card>
        <CardBody>
          <p>Locations management page</p>
        </CardBody>
      </Card>
    </div>
  )
}
