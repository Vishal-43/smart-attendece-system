import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { Button, Input, Alert } from '../../components/Common'
import './Auth.css'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      // Call forgot password API
      setSent(true)
    } catch (err) {
      setError('Failed to send reset email')
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">We'll send you a reset link</p>
        </div>

        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError('')}
            className="auth-alert"
          />
        )}

        {sent ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <Alert
              type="success"
              title="Email sent!"
              message="Check your inbox for the password reset link."
              className="auth-alert"
            />
            <Link to="/auth/login" className="auth-link-bold" style={{ marginTop: '1rem', display: 'inline-block' }}>
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />

            <Button
              variant="primary"
              size="lg"
              type="submit"
              style={{ width: '100%' }}
            >
              Send Reset Link
            </Button>
          </form>
        )}

        <p className="auth-footer">
          <Link to="/auth/login" className="auth-link">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  )
}
