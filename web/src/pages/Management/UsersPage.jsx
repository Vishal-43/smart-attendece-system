// UsersPage.jsx - Enterprise Professional User Management
import { useState } from 'react'
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '../../api/hooks'
import { Card, CardHeader, CardBody, Button, Input, Loading } from '../../components/Common'
import { 
  Plus, Edit2, Trash2, Search, X, Check, 
  Users as UsersIcon, Shield, GraduationCap, User
} from 'lucide-react'
import './Management.css'

const ROLE_COLORS = {
  admin: { bg: 'var(--purple-bg)', color: 'var(--purple-text)', border: 'var(--purple-text)', icon: Shield },
  teacher: { bg: 'var(--info-bg)', color: 'var(--info-text)', border: 'var(--info-border)', icon: GraduationCap },
  student: { bg: 'var(--success-bg)', color: 'var(--success-text)', border: 'var(--success-border)', icon: User },
}

export default function UsersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    username: '', email: '', first_name: '', last_name: '',
    phone: '', password: '', role: 'student'
  })

  const { data: users, isLoading } = useUsers({ search })
  const createMutation = useCreateUser()
  const updateMutation = useUpdateUser(editingId)
  const deleteMutation = useDeleteUser()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const openCreate = () => {
    setEditingId(null)
    setFormData({ 
      username: '', email: '', first_name: '', last_name: '', 
      phone: '', password: '', role: 'student' 
    })
    setIsModalOpen(true)
  }

  const openEdit = (row) => {
    setEditingId(row.id)
    setFormData({
      username: row.username,
      email: row.email,
      first_name: row.first_name || '',
      last_name: row.last_name || '',
      phone: row.phone || '',
      password: '',
      role: row.role || 'student'
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteMutation.mutateAsync(id)
      } catch (error) {
        console.error('Failed to delete user:', error)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = { ...formData }
    if (editingId) delete payload.password
    if (!payload.password && !editingId) {
      alert('Password is required for new users')
      return
    }
    try {
      if (editingId) {
        await updateMutation.mutateAsync(payload)
      } else {
        await createMutation.mutateAsync(payload)
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error('Failed to save user:', error)
      alert('Failed to save user. Please check the form and try again.')
    }
  }

  const userList = Array.isArray(users?.data) ? users.data : []

  const getRoleBadge = (role) => {
    const style = ROLE_COLORS[role] || ROLE_COLORS.student
    const Icon = style.icon
    return (
      <span 
        className="role-badge"
        style={{
          background: style.bg,
          color: style.color,
          borderColor: style.border,
        }}
      >
        <Icon size={12} />
        {role}
      </span>
    )
  }

  const getInitials = (user) => {
    return `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() || 
           user.username?.[0]?.toUpperCase() || 'U'
  }

  const getAvatarColor = (role) => {
    switch (role) {
      case 'admin': return 'linear-gradient(135deg, #8B5CF6, #7C3AED)'
      case 'teacher': return 'linear-gradient(135deg, #3B82F6, #2563EB)'
      default: return 'linear-gradient(135deg, #10B981, #059669)'
    }
  }

  return (
    <div className="page-inner">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="page-header__left">
          <h1 className="page-title">
            <UsersIcon size={24} />
            Users & Access
          </h1>
          <p className="page-subtitle">Manage system users and their access levels.</p>
        </div>
        <div className="page-header__actions">
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={16} />
            Add User
          </button>
        </div>
      </div>

      <Card>
        <div className="card-header">
          <div className="page-title">
             Users
          </div>
          <div className="search-bar">
            <Search size={14} className="search-bar__icon" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="search-bar__input"
            />
          </div>
        </div>

        <CardBody>
          {isLoading ? (
            <Loading />
          ) : (
            <div className="crud-table">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userList.map(row => (
                    <tr key={row.id}>
                      <td>
                        <div className="table-user">
                          <div 
                            className="table-user__avatar"
                            style={{ background: getAvatarColor(row.role) }}
                          >
                            {getInitials(row)}
                          </div>
                          <div className="table-user__info">
                            <span className="table-user__name">
                              {[row.first_name, row.last_name].filter(Boolean).join(' ') || row.username}
                            </span>
                            <span className="table-user__meta">@{row.username}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--ink-secondary)' }}>{row.email || '-'}</td>
                      <td style={{ color: 'var(--ink-secondary)' }}>{row.phone || '-'}</td>
                      <td>{getRoleBadge(row.role)}</td>
                      <td>
                        <div className="actions" style={{ justifyContent: 'flex-end' }}>
                          <button 
                            className="icon-btn icon-btn--edit" 
                            onClick={() => openEdit(row)}
                            title="Edit user"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            className="icon-btn icon-btn--delete" 
                            onClick={() => handleDelete(row.id)}
                            title="Delete user"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {userList.length === 0 && (
                    <tr>
                      <td colSpan={5}>
                        <div className="table-empty">
                          <div className="table-empty__icon">
                            <UsersIcon size={32} />
                          </div>
                          <span className="table-empty__title">No users found</span>
                          <span className="table-empty__text">
                            {search ? 'Try adjusting your search terms' : 'Get started by adding your first user'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">
                {editingId ? 'Edit User' : 'Add New User'}
              </h2>
              <button 
                className="modal__close" 
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal__body">
              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-grid">
                  <div className="form-input-wrap">
                    <label className="form-input-label">Username *</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="form-input"
                      required
                      placeholder="Enter username"
                    />
                  </div>
                  <div className="form-input-wrap">
                    <label className="form-input-label">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input"
                      required
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
                <div className="form-grid">
                  <div className="form-input-wrap">
                    <label className="form-input-label">First Name</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div className="form-input-wrap">
                    <label className="form-input-label">Last Name</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                <div className="form-grid">
                  <div className="form-input-wrap">
                    <label className="form-input-label">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="form-input-wrap">
                    <label className="form-input-label">
                      {editingId ? 'New Password' : 'Password *'}
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="form-input"
                      placeholder={editingId ? 'Enter new password' : 'Enter password'}
                      required={!editingId}
                    />
                    {editingId && (
                      <span style={{ fontSize: 11, color: 'var(--ink-hint)', marginTop: 2 }}>
                        Leave blank to keep current password
                      </span>
                    )}
                  </div>
                </div>
                <div className="form-input-wrap">
                  <label className="form-input-label">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="form-input form-select"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="modal-footer">
                  <button 
                    className="btn-secondary" 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn-primary" 
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    <Check size={16} />
                    {editingId ? 'Update User' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}