import { useState, useEffect } from 'react'
import { Card, CardHeader, CardBody, Button, Input, Select } from '../../components/Common'
import { useToast } from '../../hooks/useToast'
import { divisionsAPI } from '../../api/endpoints'
import { listBranches, listCourses } from '../../api/services'
import { Users, Plus, Edit2, Trash2, Search, X, Check } from 'lucide-react'
import './ManagementPages.css'

const EMPTY = { name: '', course_id: '', branch_id: '', year: '1', semester: '1', academic_year: '2025-2026', capacity: '' }

export default function DivisionsPage() {
  const toast = useToast()
  const [divisions, setDivisions] = useState([])
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
      const [dRes, bRes, cRes] = await Promise.all([
        divisionsAPI.listDivisions({ limit: 500 }),
        listBranches({ limit: 500 }),
        listCourses({ limit: 500 }),
      ])
      setDivisions(dRes.data || dRes || [])
      setBranches(Array.isArray(bRes) ? bRes : bRes?.data || [])
      setCourses(Array.isArray(cRes) ? cRes : cRes?.data || [])
    } catch { toast.error('Failed to load data') }
    finally { setLoading(false) }
  }

  const validate = () => {
    const errs = {}
    if (!form.name?.trim()) errs.name = 'Required'
    if (!form.course_id) errs.course_id = 'Required'
    if (!form.branch_id) errs.branch_id = 'Required'
    if (!form.academic_year?.trim()) errs.academic_year = 'Required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    const payload = { name: form.name.trim(), branch_id: parseInt(form.branch_id), year: parseInt(form.year), semester: parseInt(form.semester), academic_year: form.academic_year.trim(), capacity: form.capacity ? parseInt(form.capacity) : undefined }
    try {
      if (editingId) { await divisionsAPI.updateDivision(editingId, payload); toast.success('Division updated') }
      else { await divisionsAPI.createDivision(payload); toast.success('Division created') }
      closeModal(); fetchAll()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this division?')) return
    try { await divisionsAPI.deleteDivision(id); toast.success('Deleted'); fetchAll() }
    catch { toast.error('Failed to delete') }
  }

  const openEdit = (d) => {
    const branch = branches.find(b => b.id === d.branch_id)
    setEditingId(d.id); setForm({ name: d.name || '', course_id: branch?.course_id ? String(branch.course_id) : '', branch_id: d.branch_id || '', year: String(d.year || 1), semester: String(d.semester || 1), academic_year: d.academic_year || '2025-2026', capacity: d.capacity || '' }); setErrors({}); setIsModalOpen(true)
  }

  const closeModal = () => { setIsModalOpen(false); setEditingId(null); setForm(EMPTY); setErrors({}) }

  const filtered = divisions.filter(d => d.name?.toLowerCase().includes(search.toLowerCase()))
  const filteredBranches = branches.filter(b => !form.course_id || b.course_id === parseInt(form.course_id))
  const courseOpts = [{ label: 'Select course...', value: '' }, ...courses.map(c => ({ label: `${c.name} (${c.code})`, value: c.id }))]
  const branchOpts = [{ label: 'Select branch...', value: '' }, ...filteredBranches.map(b => ({ label: `${b.name} (${b.code})`, value: b.id }))]
  const yearOpts = Array.from({ length: 6 }, (_, i) => ({ label: `Year ${i + 1}`, value: String(i + 1) }))
  const semOpts = Array.from({ length: 12 }, (_, i) => ({ label: `Semester ${i + 1}`, value: String(i + 1) }))

  return (
    <div className="page-inner">
      <div className="mgt-header">
        <div className="mgt-header__left">
          <h1 className="page-title"><Users size={18} className="page-title-icon" />Divisions</h1>
          <p className="page-subtitle">Manage classes, sections, and student groups</p>
        </div>
        <div className="mgt-header__right">
          <Button variant="primary" onClick={() => { setEditingId(null); setForm(EMPTY); setErrors({}); setIsModalOpen(true) }}>
            <Plus size={16} /> Add Division
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="search-box"><Search size={15} className="search-icon" /><input type="text" placeholder="Search divisions..." value={search} onChange={e => setSearch(e.target.value)} className="search-input" /></div>
          <span className="page-count-badge">{filtered.length} divisions</span>
        </CardHeader>
        <CardBody>
          {loading ? <p style={{ textAlign: 'center', padding: 40, color: 'var(--ink-500)' }}>Loading...</p>
          : filtered.length === 0 ? (
            <div className="empty-state"><Users size={44} className="empty-state__icon" /><p className="empty-state__text">No divisions found</p></div>
          ) : (
            <div className="crud-table">
              <table>
                <thead><tr><th>Name</th><th>Branch</th><th>Year</th><th>Semester</th><th>Academic Year</th><th>Capacity</th><th>Actions</th></tr></thead>
                <tbody>
                  {filtered.map(d => {
                    const branch = branches.find(b => b.id === d.branch_id)
                    return (
                      <tr key={d.id}>
                        <td className="item-name">{d.name}</td>
                        <td>{branch ? branch.name : `Branch #${d.branch_id}`}</td>
                        <td>Year {d.year}</td>
                        <td>Sem {d.semester}</td>
                        <td style={{ color: 'var(--ink-500)' }}>{d.academic_year}</td>
                        <td>{d.capacity || '—'}</td>
                        <td><div className="action-btns"><button className="icon-btn icon-btn--edit" onClick={() => openEdit(d)}><Edit2 size={14} /></button><button className="icon-btn icon-btn--delete" onClick={() => handleDelete(d.id)}><Trash2 size={14} /></button></div></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal--md" onClick={e => e.stopPropagation()}>
            <div className="modal__header"><h2 className="modal__title">{editingId ? 'Edit Division' : 'Add Division'}</h2><button className="modal__close" onClick={closeModal}><X size={18} /></button></div>
            <div className="modal__body">
              <form onSubmit={handleSubmit} className="crud-form">
                <div className="form-grid">
                  <Input label="Division Name *" name="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} error={errors.name} placeholder="e.g. Section A" />
                  <Select label="Course *" name="course_id" value={form.course_id} onChange={e => setForm({ ...form, course_id: e.target.value, branch_id: '' })} options={courseOpts} error={errors.course_id} />
                  <Select label="Branch *" name="branch_id" value={form.branch_id} onChange={e => setForm({ ...form, branch_id: e.target.value })} options={branchOpts} error={errors.branch_id} disabled={!form.course_id} />
                  <Select label="Year" name="year" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} options={yearOpts} />
                  <Select label="Semester" name="semester" value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })} options={semOpts} />
                  <Input label="Academic Year *" name="academic_year" value={form.academic_year} onChange={e => setForm({ ...form, academic_year: e.target.value })} error={errors.academic_year} />
                  <Input label="Capacity" name="capacity" type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} />
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
