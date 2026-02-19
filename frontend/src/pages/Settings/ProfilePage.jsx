import { Card, CardHeader, CardBody, Button, Input } from '../../components/Common'
import { useCurrentUser, useUpdateUser } from '../../api/hooks'
import { Loading } from '../../components/Common'
import './Settings.css'

export default function ProfilePage() {
  const { data: user, isLoading } = useCurrentUser()
  const updateMutation = useUpdateUser(user?.data?.id)

  if (isLoading) return <Loading />

  return (
    <div className="settings">
      <div className="settings__header">
        <h1>User Profile</h1>
        <p>Manage your account information</p>
      </div>

      <Card>
        <CardHeader>
          <h3>Profile Information</h3>
        </CardHeader>
        <CardBody>
          <div className="settings__form">
            <Input
              label="Username"
              type="text"
              defaultValue={user?.data?.username}
              disabled
            />
            <Input
              label="Email"
              type="email"
              defaultValue={user?.data?.email}
              disabled
            />
            <Input
              label="Role"
              type="text"
              defaultValue={user?.data?.role}
              disabled
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3>Change Password</h3>
        </CardHeader>
        <CardBody>
          <div className="settings__form">
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••"
            />
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
            />
          </div>
        </CardBody>
      </Card>

      <div className="settings__actions">
        <Button variant="secondary">Cancel</Button>
        <Button variant="primary">Update Profile</Button>
      </div>
    </div>
  )
}
