import { Card, CardBody } from '../../components/Common'
import './Management.css'

export default function BranchesPage() {
  return (
    <div className="management">
      <div className="management__header">
        <div>
          <h1>Branches Management</h1>
          <p>Manage branches and departments</p>
        </div>
      </div>
      <Card>
        <CardBody>
          <p>Branches management page</p>
        </CardBody>
      </Card>
    </div>
  )
}
