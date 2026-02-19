import { Card, CardBody } from '../../components/Common'
import './Management.css'

export default function BatchesPage() {
  return (
    <div className="management">
      <div className="management__header">
        <div>
          <h1>Batches Management</h1>
          <p>Manage student batches and cohorts</p>
        </div>
      </div>
      <Card>
        <CardBody>
          <p>Batches management page</p>
        </CardBody>
      </Card>
    </div>
  )
}
