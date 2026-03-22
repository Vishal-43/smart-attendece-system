import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../../api/services'
import { Button, Input, Alert } from '../../components/Common'
import { LayoutDashboard, CheckCircle } from 'lucide-react'
import './Auth.css'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await forgotPassword(email)
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send reset email')
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
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">We'll send you a reset link</p>
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError('')} />
        )}

        {sent ? (
          <>
            <div className="auth-success-icon">
              <CheckCircle size={26} />
            </div>
            <p className="auth-success-text">
              Password reset link sent to<br />
              <strong style={{ color: 'var(--ink-900)' }}>{email}</strong>
            </p>
            <Link to="/auth/login" className="auth-link">
              <Button variant="secondary" size="lg" style={{ width: '100%', justifyContent: 'center' }}>
                Back to Sign in
              </Button>
            </Link>
          </>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="auth-form">
              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
              />

              <Button variant="primary" size="lg" type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send reset link'}
              </Button>
            </form>

            <p className="auth-footer">
              Remember your password?{' '}
              <Link to="/auth/login" className="auth-link">Sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
