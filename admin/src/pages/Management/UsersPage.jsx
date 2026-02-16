import { useState } from 'react'
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '../../api/hooks'
import { Card, CardHeader, CardBody, CardFooter, Button, Input, Table, Modal, Alert, Loading, Select } from '../../components/Common'
import { Plus, Edit2, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import './Management.css'

export default function UsersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ username: '', email: '', role: 'STUDENT' })

  const { data: users, isLoading } = useUsers({ page, limit: 10, search })
  const createMutation = useCreateUser()
  const updateMutation = useUpdateUser(editingId)
  const deleteMutation = useDeleteUser()

  const columns = [
    { key: 'username', label: 'Username' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="management__actions">
          <button
            className="btn btn--icon btn--sm"
            onClick={() => handleEdit(row)}
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
          <button
            className="btn btn--icon btn--sm"
            onClick={() => handleDelete(row.id)}
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreate = () => {
    setEditingId(null)
    setFormData({ username: '', email: '', role: 'STUDENT' })
    setIsModalOpen(true)
  }

  const handleEdit = (row) => {
    setEditingId(row.id)
    setFormData({ username: row.username, email: row.email, role: row.role || 'STUDENT' })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editingId) {
        await updateMutation.mutateAsync(formData)
      } else {
        await createMutation.mutateAsync(formData)
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="management">
      <div className="management__header">
        <div>
          <h1>Users Management</h1>
          <p>Manage system users and access levels</p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          <Plus size={20} />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="management__search">
            <Search size={20} className="management__search-icon" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="management__search-input"
            />
          </div>
        </CardHeader>

        <CardBody>
          {isLoading ? (
            <Loading />
          ) : (
            <>
              <Table columns={columns} data={users?.data?.items || []} />

              <div className="management__pagination">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft size={16} />
                </Button>
                <span className="management__page-info">
                  Page {page} of {users?.data?.pages || 1}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= (users?.data?.pages || 1)}
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </>
          )}
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit User' : 'Add New User'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="management__form">
          <Input
            label="Username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleFormChange}
            required
          />

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleFormChange}
            required
          />

          <Select
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleFormChange}
            options={[
              { label: 'Student', value: 'STUDENT' },
              { label: 'Teacher', value: 'TEACHER' },
              { label: 'Admin', value: 'ADMIN' },
            ]}
          />

          <div className="management__modal-actions">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingId ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
