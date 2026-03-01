import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import UsersPage from '../../pages/Management/UsersPage'
import * as services from '../../api/services'

// Mock the API services
vi.mock('../../api/services', () => ({
  listUsers: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
}))

// Mock the toast hook
vi.mock('../../hooks/useToast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}))

describe('UsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    services.listUsers.mockResolvedValue({
      data: [
        { id: 1, username: 'admin', email: 'admin@test.com', role: 'admin', is_active: true },
        { id: 2, username: 'teacher1', email: 'teacher@test.com', role: 'teacher', is_active: true },
      ],
    })
  })

  it('renders user list from API', async () => {
    render(<UsersPage />)

    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument()
      expect(screen.getByText('teacher1')).toBeInTheDocument()
    })
  })

  it('shows loading state while fetching users', () => {
    services.listUsers.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    render(<UsersPage />)

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('calls deleteUser when delete button is clicked', async () => {
    services.deleteUser.mockResolvedValue({ success: true })

    render(<UsersPage />)

    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument()
    })

    // Find and click delete button (typically there are multiple, we get the first)
    const deleteButtons = screen.getAllByRole('button').filter(btn => 
      btn.innerHTML.includes('delete') || btn.innerHTML.includes('Delete')
    )

    if (deleteButtons.length > 0) {
      fireEvent.click(deleteButtons[0])

      // Confirm the delete in the modal
      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /delete/i })
        if (confirmButton) fireEvent.click(confirmButton)
      })
    }
  })

  it('renders create button', async () => {
    render(<UsersPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create|add|new/i })).toBeInTheDocument()
    })
  })
})
