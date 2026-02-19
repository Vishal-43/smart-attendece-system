import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Alert } from '../../components/Common'
import './Auth.css'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      setSuccess(true)
      setTimeout(() => navigate('/auth/login'), 2000)
    } catch (err) {
      setError('Failed to reset password')
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Set New Password</h1>
          <p className="auth-subtitle">Enter your new password</p>
        </div>

        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError('')}
            className="auth-alert"
          />
        )}

        {success && (
          <Alert
            type="success"
            message="Password reset successful. Redirecting to login..."
            className="auth-alert"
          />
        )}

        {!success && (
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
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button
              variant="primary"
              size="lg"
              type="submit"
              style={{ width: '100%' }}
            >
              Reset Password
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
