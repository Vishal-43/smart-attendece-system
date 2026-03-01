import { Link } from 'react-router-dom'
import { Card, CardBody, Button } from '../components/Common'
import { AlertCircle } from 'lucide-react'
import './NotFoundPage.css'

export default function NotFoundPage() {
  return (
    <div className="not-found">
      <Card className="not-found__card">
        <CardBody>
          <div className="not-found__content">
            <AlertCircle size={64} className="not-found__icon" />
            <h1 className="not-found__title">Page Not Found</h1>
            <p className="not-found__message">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <Link to="/" className="not-found__link">
              <Button variant="primary">Go to Dashboard</Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
