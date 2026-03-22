import { useState, useEffect } from 'react'
import { Card, CardHeader, CardBody, Button, Input, Select } from '../../components/Common'
import { useToast } from '../../hooks/useToast'
import { subjectsAPI } from '../../api/endpoints'
import { listCourses, listBranches } from '../../api/services'
import { BookOpen, Plus, Edit2, Trash2, Search, X, Check } from 'lucide-react'
import './ManagementPages.css'

const EMPTY = { name: '', code: '', description: '', course_id: '', branch_id: '', semester: '1', is_active: true }

export default function SubjectsPage() {
  const toast = useToast()
  const [subjects, setSubjects] = useState([])
  const [courses, setCourses] = useState([])
  const [branches, setBranches] = useState([])
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
      const [subRes, cRes, bRes] = await Promise.all([
        subjectsAPI.listSubjects({ limit: 500 }),
        listCourses({ limit: 500 }),
        listBranches({ limit: 500 }),
      ])
      setSubjects(subRes.data || subRes || [])
      setCourses(Array.isArray(cRes) ? cRes : cRes?.data || [])
      setBranches(Array.isArray(bRes) ? bRes : bRes?.data || [])
    } catch { toast.error('Failed to load data') }
    finally { setLoading(false) }
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Required'
    if (!form.code.trim()) errs.code = 'Required'
    if (!form.course_id) errs.course_id = 'Required'
    if (!form.branch_id) errs.branch_id = 'Required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    const payload = { name: form.name.trim(), code: form.code.trim().toUpperCase(), description: form.description.trim() || undefined, course_id: parseInt(form.course_id), branch_id: parseInt(form.branch_id), semester: parseInt(form.semester), is_active: form.is_active }
    try {
      if (editingId) { await subjectsAPI.updateSubject(editingId, payload); toast.success('Subject updated') }
      else { await subjectsAPI.createSubject(payload); toast.success('Subject created') }
      closeModal(); fetchAll()
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subject?')) return
    try { await subjectsAPI.deleteSubject(id); toast.success('Deleted'); fetchAll() }
    catch { toast.error('Failed to delete') }
  }

  const openEdit = (sub) => {
    setEditingId(sub.id); setForm({ name: sub.name || '', code: sub.code || '', description: sub.description || '', course_id: sub.course_id || '', branch_id: sub.branch_id || '', semester: String(sub.semester || 1), is_active: sub.is_active !== false }); setErrors({}); setIsModalOpen(true)
  }

  const closeModal = () => { setIsModalOpen(false); setEditingId(null); setForm(EMPTY); setErrors({}) }

  const filtered = subjects.filter(sub => sub.name?.toLowerCase().includes(search.toLowerCase()) || sub.code?.toLowerCase().includes(search.toLowerCase()))
  const filteredBranches = branches.filter(b => !form.course_id || b.course_id === parseInt(form.course_id))
  const courseOpts = [{ label: 'Select course...', value: '' }, ...courses.map(c => ({ label: `${c.name} (${c.code})`, value: c.id }))]
  const branchOpts = [{ label: 'Select branch...', value: '' }, ...filteredBranches.map(b => ({ label: `${b.name} (${b.code})`, value: b.id }))]
  const semOpts = Array.from({ length: 12 }, (_, i) => ({ label: `Semester ${i + 1}`, value: String(i + 1) }))

  return (
    <div className="page-inner">
      <div className="mgt-header">
        <div className="mgt-header__left">
          <h1 className="page-title"><BookOpen size={18} className="page-title-icon" />Subjects</h1>
          <p className="page-subtitle">Manage subjects and course modules</p>
        </div>
        <div className="mgt-header__right">
          <Button variant="primary" onClick={() => { setForm(EMPTY); setEditingId(null); setErrors({}); setIsModalOpen(true) }}>
            <Plus size={16} /> Add Subject
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="search-box"><Search size={15} className="search-icon" /><input type="text" placeholder="Search subjects..." value={search} onChange={e => setSearch(e.target.value)} className="search-input" /></div>
          <span className="page-count-badge">{filtered.length} subjects</span>
        </CardHeader>
        <CardBody>
          {loading ? <p style={{ textAlign: 'center', padding: 40, color: 'var(--ink-500)' }}>Loading...</p>
          : filtered.length === 0 ? (
            <div className="empty-state"><BookOpen size={44} className="empty-state__icon" /><p className="empty-state__text">No subjects found</p></div>
          ) : (
            <div className="crud-table">
              <table>
                <thead><tr><th>Code</th><th>Name</th><th>Course</th><th>Branch</th><th>Sem</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {filtered.map(sub => (
                    <tr key={sub.id}>
                      <td><span className="code-badge">{sub.code}</span></td>
                      <td className="item-name">{sub.name}</td>
                      <td>{sub.course_name || '—'}</td>
                      <td>{sub.branch_name || '—'}</td>
                      <td>Sem {sub.semester}</td>
                      <td><span className={`status-badge status-badge--${sub.is_active ? 'active' : 'inactive'}`}>{sub.is_active ? 'Active' : 'Inactive'}</span></td>
                      <td><div className="action-btns"><button className="icon-btn icon-btn--edit" onClick={() => openEdit(sub)}><Edit2 size={14} /></button><button className="icon-btn icon-btn--delete" onClick={() => handleDelete(sub.id)}><Trash2 size={14} /></button></div></td>
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
            <div className="modal__header"><h2 className="modal__title">{editingId ? 'Edit' : 'Add'} Subject</h2><button className="modal__close" onClick={closeModal}><X size={18} /></button></div>
            <div className="modal__body">
              <form onSubmit={handleSubmit} className="crud-form">
                <div className="form-grid">
                  <Input label="Subject Name *" name="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} error={errors.name} />
                  <Input label="Subject Code *" name="code" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} error={errors.code} />
                  <Select label="Course *" name="course_id" value={form.course_id} onChange={e => setForm({ ...form, course_id: e.target.value, branch_id: '' })} options={courseOpts} error={errors.course_id} />
                  <Select label="Branch *" name="branch_id" value={form.branch_id} onChange={e => setForm({ ...form, branch_id: e.target.value })} options={branchOpts} error={errors.branch_id} disabled={!form.course_id} />
                  <Select label="Semester *" name="semester" value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })} options={semOpts} />
                </div>
                <Input label="Description" name="description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                <label className="toggle-label">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                  <span>Active subject</span>
                </label>
                <div className="modal__footer"><Button variant="secondary" type="button" onClick={closeModal}>Cancel</Button><Button variant="primary" type="submit"><Check size={15} />{editingId ? 'Update' : 'Create'}</Button></div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
