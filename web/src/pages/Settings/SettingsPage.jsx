import { useState } from 'react'
import { Card, CardHeader, CardBody, Button, Loading } from '../../components/Common'
import { useAuthStore } from '../../stores/authStore'
import { useToast } from '../../hooks/useToast'
import { updateUserPassword } from '../../api/services'
import { Shield, Lock, Eye, EyeOff, Check, X } from 'lucide-react'
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
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  })

  const passwordRequirements = [
    { test: (p) => p.length >= 8, label: 'At least 8 characters' },
    { test: (p) => /[A-Z]/.test(p), label: 'One uppercase letter' },
    { test: (p) => /[0-9]/.test(p), label: 'One number' },
  ]

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
    <div className="page-inner">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your account settings and preferences</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--r-lg)',
              background: 'linear-gradient(135deg, var(--primary-600), var(--primary-700))',
              display: 'grid',
              placeItems: 'center',
              color: '#fff'
            }}>
              <Shield size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Security Settings</h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-hint)' }}>Update your password to keep your account secure</p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleChangePassword} className="settings__form">
            <div className="form-group">
              <label className="form-group__label">Current Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-hint)' }} />
                <input
                  type={showPasswords.old ? 'text' : 'password'}
                  value={formData.oldPassword}
                  onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                  placeholder="Enter your current password"
                  className={`input ${errors.oldPassword ? 'input--error' : ''}`}
                  style={{ paddingLeft: '44px', paddingRight: '44px' }}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, old: !showPasswords.old })}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--ink-hint)',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPasswords.old ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.oldPassword && <span className="form-group__error">{errors.oldPassword}</span>}
            </div>

            <div className="form-group">
              <label className="form-group__label">New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-hint)' }} />
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  placeholder="Enter a new password"
                  className={`input ${errors.newPassword ? 'input--error' : ''}`}
                  style={{ paddingLeft: '44px', paddingRight: '44px' }}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--ink-hint)',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.newPassword && <span className="form-group__error">{errors.newPassword}</span>}
              
              {formData.newPassword && (
                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {passwordRequirements.map((req, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: req.test(formData.newPassword) ? 'var(--green-text)' : 'var(--ink-hint)' }}>
                      {req.test(formData.newPassword) ? <Check size={14} /> : <X size={14} />}
                      {req.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-group__label">Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-hint)' }} />
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirm your new password"
                  className={`input ${errors.confirmPassword ? 'input--error' : ''}`}
                  style={{ paddingLeft: '44px', paddingRight: '44px' }}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--ink-hint)',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <span className="form-group__error">{errors.confirmPassword}</span>}
            </div>

            <div className="settings__actions">
              <Button 
                variant="primary" 
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    Updating...
                  </>
                ) : 'Change Password'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
