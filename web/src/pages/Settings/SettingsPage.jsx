import { useState } from 'react'
import { Card, CardHeader, CardBody, Input, Button, Loading } from '../../components/Common'
import { useAuthStore } from '../../stores/authStore'
import { useToast } from '../../hooks/useToast'
import { updateUserPassword } from '../../api/services'
import './Settings.css'

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user)
  const toast = useToast()

  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}
    if (!formData.oldPassword) newErrors.oldPassword = 'Current password is required'
    if (!formData.newPassword) newErrors.newPassword = 'New password is required'
    if (formData.newPassword.length < 8) newErrors.newPassword = 'Password must be at least 8 characters'
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      await updateUserPassword(user.id, {
        old_password: formData.oldPassword,
        new_password: formData.newPassword,
      })
      
      setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' })
      setErrors({})
      toast.success('Password changed successfully')
    } catch (error) {
      const message = error.response?.data?.detail || error.message || 'Failed to change password'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return <Loading />

  return (
    <div className="settings">
      <div className="settings__header">
        <h1>Settings</h1>
        <p>Manage your account settings and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <h3>Change Password</h3>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleChangePassword} className="settings__form">
            <Input
              label="Current Password"
              type="password"
              value={formData.oldPassword}
              onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
              placeholder="Enter your current password"
              error={errors.oldPassword}
              disabled={loading}
            />

            <Input
              label="New Password"
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              placeholder="Enter a new password (min 8 characters)"
              error={errors.newPassword}
              disabled={loading}
            />

            <Input
              label="Confirm New Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Confirm your new password"
              error={errors.confirmPassword}
              disabled={loading}
            />

            <div className="settings__actions">
              <Button 
                variant="primary" 
                type="submit"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Change Password'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
