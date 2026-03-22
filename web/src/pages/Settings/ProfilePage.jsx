import { useState, useEffect } from 'react'
import { Card, CardHeader, CardBody, Button, Loading } from '../../components/Common'
import { useAuthStore } from '../../stores/authStore'
import { useToast } from '../../hooks/useToast'
import { updateUser } from '../../api/services'
import { User, Mail, Shield, Save, Edit2, X } from 'lucide-react'
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

  const initials = `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'

  return (
    <div className="page-inner">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Profile</h1>
          <p className="page-subtitle">Manage your account information</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        <Card>
          <CardBody style={{ textAlign: 'center', padding: '40px 24px' }}>
            <div style={{
              width: '96px',
              height: '96px',
              borderRadius: 'var(--r-xl)',
              background: 'linear-gradient(135deg, var(--primary-600), var(--primary-700))',
              color: '#fff',
              fontSize: '32px',
              fontWeight: 700,
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
            }}>
              {initials}
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>
              {user.username}
            </h3>
            <p style={{ color: 'var(--ink-secondary)', fontSize: '14px', marginBottom: '16px' }}>
              {user.email}
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              background: 'var(--purple-bg)',
              color: 'var(--purple-text)',
              borderRadius: 'var(--r-full)',
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'capitalize',
              border: '1px solid var(--purple-text)',
            }}>
              <Shield size={14} />
              {user.role || 'User'}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--r-lg)',
                background: 'var(--bg-surface)',
                display: 'grid',
                placeItems: 'center',
                color: 'var(--ink-secondary)'
              }}>
                <User size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Profile Information</h3>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-hint)' }}>Update your personal details</p>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSaveProfile} className="settings__form">
              <div className="form-group">
                <label className="form-group__label">Username</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-hint)' }} />
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    disabled={!isEditing || loading}
                    className={`input ${errors.username ? 'input--error' : ''}`}
                    style={{ paddingLeft: '44px' }}
                  />
                </div>
                {errors.username && <span className="form-group__error">{errors.username}</span>}
              </div>

              <div className="form-group">
                <label className="form-group__label">Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-hint)' }} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing || loading}
                    className={`input ${errors.email ? 'input--error' : ''}`}
                    style={{ paddingLeft: '44px' }}
                  />
                </div>
                {errors.email && <span className="form-group__error">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-group__label">Role</label>
                <div style={{ position: 'relative' }}>
                  <Shield size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-hint)' }} />
                  <input
                    type="text"
                    value={user.role || ''}
                    disabled={true}
                    className="input"
                    style={{ paddingLeft: '44px', opacity: 0.7 }}
                  />
                </div>
              </div>

              <div className="settings__actions">
                {isEditing ? (
                  <>
                    <Button
                      variant="secondary"
                      type="button"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      <X size={16} />
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="primary"
                    type="button"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 size={16} />
                    Edit Profile
                  </Button>
                )}
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
