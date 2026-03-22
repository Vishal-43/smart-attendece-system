import { useState, useEffect } from 'react'
import { Card, CardHeader, CardBody, Button, Input, Select } from '../../components/Common'
import { useToast } from '../../hooks/useToast'
import { branchesAPI } from '../../api/endpoints'
import { listCourses } from '../../api/services'
import { GitBranch, Plus, Edit2, Trash2, Search, X, Check } from 'lucide-react'
import './ManagementPages.css'

const EMPTY = { name: '', code: '', branch_code: '', course_id: '' }

export default function BranchesPage() {
  const toast = useToast()
  const [branches, setBranches] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [bRes, cRes] = await Promise.all([
        branchesAPI.listBranches({ limit: 500 }),
        listCourses({ limit: 500 }),
      ])
      setBranches(bRes.data || bRes || [])
      setCourses(Array.isArray(cRes) ? cRes : cRes?.data || [])
    } catch { toast.error('Failed to load data') }
    finally { setLoading(false) }
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Required'
    if (!form.code.trim()) errs.code = 'Required'
    if (!form.course_id) errs.course_id = 'Required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    const payload = { name: form.name.trim(), code: form.code.trim().toUpperCase(), branch_code: form.branch_code.trim().toUpperCase(), course_id: parseInt(form.course_id) }
    try {
      if (editingId) { await branchesAPI.updateBranch(editingId, payload); toast.success('Branch updated') }
      else { await branchesAPI.createBranch(payload); toast.success('Branch created') }
      closeModal(); fetchAll()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this branch?')) return
    try { await branchesAPI.deleteBranch(id); toast.success('Deleted'); fetchAll() }
    catch { toast.error('Failed to delete') }
  }

  const openEdit = (b) => {
    setEditingId(b.id); setForm({ name: b.name || '', code: b.code || '', branch_code: b.branch_code || '', course_id: b.course_id || '' }); setErrors({}); setIsModalOpen(true)
  }

  const closeModal = () => { setIsModalOpen(false); setEditingId(null); setForm(EMPTY); setErrors({}) }

  const filtered = branches.filter(b => b.name?.toLowerCase().includes(search.toLowerCase()) || b.code?.toLowerCase().includes(search.toLowerCase()))
  const courseOpts = [{ label: 'Select course...', value: '' }, ...courses.map(c => ({ label: `${c.name} (${c.code})`, value: c.id }))]

  return (
    <div className="page-inner">
      <div className="mgt-header">
        <div className="mgt-header__left">
          <h1 className="page-title"><GitBranch size={18} className="page-title-icon" />Branches</h1>
          <p className="page-subtitle">Manage course specializations and streams</p>
        </div>
        <div className="mgt-header__right">
          <Button variant="primary" onClick={() => { setEditingId(null); setForm(EMPTY); setErrors({}); setIsModalOpen(true) }}>
            <Plus size={16} /> Add Branch
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="search-box"><Search size={15} className="search-icon" /><input type="text" placeholder="Search branches..." value={search} onChange={e => setSearch(e.target.value)} className="search-input" /></div>
          <span className="page-count-badge">{filtered.length} branches</span>
        </CardHeader>
        <CardBody>
          {loading ? <p style={{ textAlign: 'center', padding: 40, color: 'var(--ink-500)' }}>Loading...</p>
          : filtered.length === 0 ? (
            <div className="empty-state"><GitBranch size={44} className="empty-state__icon" /><p className="empty-state__text">No branches found</p></div>
          ) : (
            <div className="crud-table">
              <table>
                <thead><tr><th>Branch Name</th><th>Code</th><th>Branch Code</th><th>Course</th><th>Actions</th></tr></thead>
                <tbody>
                  {filtered.map(b => (
                    <tr key={b.id}>
                      <td className="item-name">{b.name}</td>
                      <td><span className="code-badge">{b.code}</span></td>
                      <td style={{ color: 'var(--ink-500)' }}>{b.branch_code || '—'}</td>
                      <td>{courses.find(c => c.id === b.course_id)?.name || `Course #${b.course_id}`}</td>
                      <td><div className="action-btns"><button className="icon-btn icon-btn--edit" onClick={() => openEdit(b)}><Edit2 size={14} /></button><button className="icon-btn icon-btn--delete" onClick={() => handleDelete(b.id)}><Trash2 size={14} /></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal--md" onClick={e => e.stopPropagation()}>
            <div className="modal__header"><h2 className="modal__title">{editingId ? 'Edit Branch' : 'Add Branch'}</h2><button className="modal__close" onClick={closeModal}><X size={18} /></button></div>
            <div className="modal__body">
              <form onSubmit={handleSubmit} className="crud-form">
                <Select label="Course *" name="course_id" value={form.course_id} onChange={e => setForm({ ...form, course_id: e.target.value })} options={courseOpts} error={errors.course_id} />
                <div className="form-grid">
                  <Input label="Branch Name *" name="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} error={errors.name} />
                  <Input label="Code *" name="code" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} error={errors.code} />
                  <Input label="Branch Code" name="branch_code" value={form.branch_code} onChange={e => setForm({ ...form, branch_code: e.target.value })} />
                </div>
                <div className="modal__footer"><Button variant="secondary" type="button" onClick={closeModal}>Cancel</Button><Button variant="primary" type="submit"><Check size={15} />{editingId ? 'Update' : 'Create'}</Button></div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
