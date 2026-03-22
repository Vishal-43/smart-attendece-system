import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { resetPassword } from '../../api/services'
import { Button, Input, Alert } from '../../components/Common'
import { LayoutDashboard, CheckCircle } from 'lucide-react'
import './Auth.css'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!token) { setError('Invalid or missing reset token'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }

    setLoading(true)
    try {
      await resetPassword(token, password)
      setSuccess(true)
      setTimeout(() => navigate('/auth/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <LayoutDashboard size={20} color="#fff" strokeWidth={2} />
          </div>
          <h1 className="auth-title">Set New Password</h1>
          <p className="auth-subtitle">Enter your new password</p>
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError('')} />
        )}

        {success ? (
          <>
            <div className="auth-success-icon">
              <CheckCircle size={26} />
            </div>
            <p className="auth-success-text">
              Password reset successful.<br />Redirecting to login...
            </p>
            <Link to="/auth/login">
              <Button variant="secondary" size="lg" style={{ width: '100%', justifyContent: 'center' }}>
                Back to Sign in
              </Button>
            </Link>
          </>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="auth-form">
              <Input
                label="New Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                required
              />

              <Button variant="primary" size="lg" type="submit" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset password'}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
