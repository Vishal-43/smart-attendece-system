import { Card, CardHeader, CardBody, Input, Select, Button } from '../../components/Common'
import './Settings.css'

export default function SettingsPage() {
  return (
    <div className="settings">
      <div className="settings__header">
        <h1>System Settings</h1>
        <p>Configure application settings and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <h3>General Settings</h3>
        </CardHeader>
        <CardBody>
          <div className="settings__form">
            <Input label="Application Name" defaultValue="Smart Attendance System" />
            <Select
              label="Theme"
              options={[
                { label: 'Light', value: 'light' },
                { label: 'Dark', value: 'dark' },
              ]}
            />
            <Select
              label="Language"
              options={[
                { label: 'English', value: 'en' },
                { label: 'Hindi', value: 'hi' },
              ]}
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3>Attendance Settings</h3>
        </CardHeader>
        <CardBody>
          <div className="settings__form">
            <Input label="QR Code Refresh Interval (seconds)" type="number" defaultValue="25" />
            <Input label="OTP Expiry Time (seconds)" type="number" defaultValue="60" />
            <Input label="Geofence Radius (meters)" type="number" defaultValue="100" />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3>Security Settings</h3>
        </CardHeader>
        <CardBody>
          <div className="settings__form">
            <Select
              label="Password Policy"
              options={[
                { label: 'Strong', value: 'strong' },
                { label: 'Medium', value: 'medium' },
              ]}
            />
            <Input label="Session Timeout (minutes)" type="number" defaultValue="30" />
          </div>
        </CardBody>
      </Card>

      <div className="settings__actions">
        <Button variant="primary">Save Settings</Button>
      </div>
    </div>
  )
}
