import { Card, CardBody } from '../../components/Common'
import './Management.css'

export default function AccessPointsPage() {
  return (
    <div className="management">
      <div className="management__header">
        <div>
          <h1>Access Points</h1>
          <p>Manage WiFi and Bluetooth access points</p>
        </div>
      </div>
      <Card>
        <CardBody>
          <p>Access Points management page</p>
        </CardBody>
      </Card>
    </div>
  )
}
