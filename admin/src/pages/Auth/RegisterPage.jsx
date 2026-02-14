import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useRegister } from '../../api/hooks'
import { Button, Input, Alert } from '../../components/Common'
import './Auth.css'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const registerMutation = useRegister()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      await registerMutation.mutateAsync({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      })

      navigate('/auth/login')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Smart Attendance Admin</p>
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
            label="Username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="admin"
            required
          />

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

          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />

          <Button
            variant="primary"
            size="lg"
            type="submit"
            disabled={registerMutation.isPending}
            style={{ width: '100%' }}
          >
            {registerMutation.isPending ? 'Registering...' : 'Register'}
          </Button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/auth/login" className="auth-link-bold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
