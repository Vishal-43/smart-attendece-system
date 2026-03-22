import { useState, useEffect } from 'react'
import { Card, CardHeader, CardBody, Button, Input } from '../../components/Common'
import { useToast } from '../../hooks/useToast'
import { coursesAPI } from '../../api/endpoints'
import { BookOpen, Plus, Edit2, Trash2, Search, X, Check } from 'lucide-react'
import './ManagementPages.css'

const EMPTY = { name: '', code: '', duration_years: '4', total_semesters: '8', college_code: '' }

export default function CoursesPage() {
  const toast = useToast()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})

  useEffect(() => { fetchCourses() }, [])

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const res = await coursesAPI.listCourses({ limit: 500 })
      setCourses(res.data || res || [])
    } catch { toast.error('Failed to load courses') }
    finally { setLoading(false) }
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Required'
    if (!form.code.trim()) errs.code = 'Required'
    if (!form.college_code.trim()) errs.college_code = 'Required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    const payload = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      duration_years: parseInt(form.duration_years),
      total_semesters: parseInt(form.total_semesters),
      college_code: form.college_code.trim().toUpperCase(),
    }
    try {
      if (editingId) { await coursesAPI.updateCourse(editingId, payload); toast.success('Course updated') }
      else { await coursesAPI.createCourse(payload); toast.success('Course created') }
      closeModal(); fetchCourses()
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course?')) return
    try { await coursesAPI.deleteCourse(id); toast.success('Deleted'); fetchCourses() }
    catch { toast.error('Failed to delete') }
  }

  const openEdit = (c) => {
    setEditingId(c.id)
    setForm({ name: c.name || '', code: c.code || '', duration_years: String(c.duration_years || 4), total_semesters: String(c.total_semesters || 8), college_code: c.college_code || '' })
    setErrors({}); setIsModalOpen(true)
  }

  const closeModal = () => { setIsModalOpen(false); setEditingId(null); setForm(EMPTY); setErrors({}) }

  const filtered = courses.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()) || c.code?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="page-inner">
      <div className="mgt-header">
        <div className="mgt-header__left">
          <h1 className="page-title"><BookOpen size={18} className="page-title-icon" />Courses</h1>
          <p className="page-subtitle">Manage academic programs and degrees</p>
        </div>
        <div className="mgt-header__right">
          <Button variant="primary" onClick={() => { setEditingId(null); setForm(EMPTY); setErrors({}); setIsModalOpen(true) }}>
            <Plus size={16} /> Add Course
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="search-box">
            <Search size={15} className="search-icon" />
            <input type="text" placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} className="search-input" />
          </div>
          <span className="page-count-badge">{filtered.length} courses</span>
        </CardHeader>
        <CardBody>
          {loading ? (
            <p style={{ textAlign: 'center', padding: 40, color: 'var(--ink-500)' }}>Loading...</p>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <BookOpen size={44} className="empty-state__icon" />
              <p className="empty-state__text">No courses found</p>
            </div>
          ) : (
            <div className="crud-table">
              <table>
                <thead><tr><th>Course Name</th><th>Code</th><th>College Code</th><th>Duration</th><th>Semesters</th><th>Actions</th></tr></thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id}>
                      <td className="item-name">{c.name}</td>
                      <td><span className="code-badge">{c.code}</span></td>
                      <td style={{ color: 'var(--ink-500)' }}>{c.college_code || '—'}</td>
                      <td>{c.duration_years} yr{c.duration_years !== 1 ? 's' : ''}</td>
                      <td>{c.total_semesters}</td>
                      <td>
                        <div className="action-btns">
                          <button className="icon-btn icon-btn--edit" onClick={() => openEdit(c)}><Edit2 size={14} /></button>
                          <button className="icon-btn icon-btn--delete" onClick={() => handleDelete(c.id)}><Trash2 size={14} /></button>
                        </div>
                      </td>
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
            <div className="modal__header">
              <h2 className="modal__title">{editingId ? 'Edit Course' : 'Add Course'}</h2>
              <button className="modal__close" onClick={closeModal}><X size={18} /></button>
            </div>
            <div className="modal__body">
              <form onSubmit={handleSubmit} className="crud-form">
                <div className="form-grid">
                  <Input label="Course Name *" name="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} error={errors.name} placeholder="e.g. Bachelor of Computer Applications" />
                  <Input label="Course Code *" name="code" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} error={errors.code} placeholder="e.g. BCA" />
                  <Input label="College Code *" name="college_code" value={form.college_code} onChange={e => setForm({ ...form, college_code: e.target.value })} error={errors.college_code} placeholder="e.g. ENGG" />
                  <Input label="Duration (Years) *" name="duration_years" type="number" value={form.duration_years} min="1" onChange={e => setForm({ ...form, duration_years: e.target.value })} />
                  <Input label="Total Semesters *" name="total_semesters" type="number" value={form.total_semesters} min="1" onChange={e => setForm({ ...form, total_semesters: e.target.value })} />
                </div>
                <div className="modal__footer">
                  <Button variant="secondary" type="button" onClick={closeModal}>Cancel</Button>
                  <Button variant="primary" type="submit"><Check size={15} />{editingId ? 'Update' : 'Create'}</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
