import { Component } from 'react'
import { Link } from 'react-router-dom'
import { Button } from './Common'
import './ErrorBoundary.css'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary__card">
            <div className="error-boundary__code">500</div>
            <h1 className="error-boundary__title">Something went wrong</h1>
            <p className="error-boundary__message">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <div className="error-boundary__actions">
              <Button variant="secondary" onClick={this.handleReset}>
                Try Again
              </Button>
              <Link to="/">
                <Button variant="primary">Go to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
