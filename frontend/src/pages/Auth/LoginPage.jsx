import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useLogin } from '../../api/hooks'
import { useAuthStore } from '../../stores/authStore'
import { Button, Input, Alert } from '../../components/Common'
import './Auth.css'

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const loginMutation = useLogin()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const response = await loginMutation.mutateAsync({
        email: formData.email,
        password: formData.password,
      })

      const { user, access_token, refresh_token } = response.data
      login(user, access_token, refresh_token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.')
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Smart Attendance</h1>
          <p className="auth-subtitle">Admin Dashboard</p>
        </div>

        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError('')}
            className="auth-alert"
          />
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="admin@example.com"
            required
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />

          <div className="auth-options">
            <Link to="/auth/forgot-password" className="auth-link">
              Forgot password?
            </Link>
          </div>

          <Button
            variant="primary"
            size="lg"
            type="submit"
            disabled={loginMutation.isPending}
            style={{ width: '100%' }}
          >
            {loginMutation.isPending ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <p className="auth-footer">
          Don't have an account?{' '}
          <Link to="/auth/register" className="auth-link-bold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
