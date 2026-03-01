import { useState, useEffect } from 'react'
import { Card, CardHeader, CardBody, Button, Input, Loading } from '../../components/Common'
import { useAuthStore } from '../../stores/authStore'
import { useToast } from '../../hooks/useToast'
import { updateUser } from '../../api/services'
import './Settings.css'

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const toast = useToast()

  const [formData, setFormData] = useState({
    username: '',
    email: '',
  })
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
      })
    }
  }, [user])

  const validateForm = () => {
    const newErrors = {}
    if (!formData.username) newErrors.username = 'Username is required'
    if (!formData.email) newErrors.email = 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      await updateUser(user.id, {
        username: formData.username,
        email: formData.email,
      })
      
      // Update store with new user data
      setUser({
        ...user,
        username: formData.username,
        email: formData.email,
      })
      
      setIsEditing(false)
      setErrors({})
      toast.success('Profile updated successfully')
    } catch (error) {
      const message = error.response?.data?.detail || error.message || 'Failed to update profile'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    // Reset form to current user data
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
      })
    }
    setIsEditing(false)
    setErrors({})
  }

  if (!user) return <Loading />

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
          <form onSubmit={handleSaveProfile} className="settings__form">
            <Input
              label="Username"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              disabled={!isEditing || loading}
              error={errors.username}
            />

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!isEditing || loading}
              error={errors.email}
            />

            <Input
              label="Role"
              type="text"
              value={user.role || ''}
              disabled={true}
            />

            {isEditing ? (
              <div className="settings__actions">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            ) : (
              <div className="settings__actions">
                <Button
                  variant="primary"
                  type="button"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              </div>
            )}
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
