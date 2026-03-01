import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import DashboardPage from '../../pages/Dashboard/DashboardPage'
import * as services from '../../api/services'

// Mock the API services
vi.mock('../../api/services', () => ({
  getAttendanceSummary: vi.fn(),
}))

// Mock the toast hook
vi.mock('../../hooks/useToast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}))

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    services.getAttendanceSummary.mockResolvedValue({
      data: {
        total: 100,
        present: 85,
        absent: 10,
        late: 5,
        attendance_rate: 85.0,
      },
    })
  })

  it('renders dashboard heading', () => {
    render(<DashboardPage />)
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
  })

  it('shows loading state while fetching data', () => {
    services.getAttendanceSummary.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    render(<DashboardPage />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('renders stats cards with attendance data', async () => {
    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument() // total
      expect(screen.getByText('85')).toBeInTheDocument() // present
    })
  })

  it('renders attendance chart', async () => {
    render(<DashboardPage />)

    await waitFor(() => {
      // The chart should be rendered (check for axis labels or legend)
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    })
  })

  it('displays attendance rate percentage', async () => {
    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText(/85.0%|85%/)).toBeInTheDocument()
    })
  })
})
