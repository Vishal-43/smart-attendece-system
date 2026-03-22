import { useState, useEffect } from 'react'
import { Card, CardHeader, CardBody, Button, Input, Loading, Select } from '../../components/Common'
import { useToast } from '../../hooks/useToast'
import { batchesAPI } from '../../api/endpoints'
import { listDivisions, listBranches, listCourses } from '../../api/services'
import { Layers, Plus, Edit2, Trash2, Search, X, Check } from 'lucide-react'
import './ManagementPages.css'

const EMPTY_FORM = { 
  name: '', course_id: '', branch_id: '', division_id: '', 
  batch_number: '1', semester: '1', academic_year: '2025-2026' 
}

export default function BatchesPage() {
  const toast = useToast()
  const [batches, setBatches] = useState([])
  const [divisions, setDivisions] = useState([])
  const [branches, setBranches] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [bRes, dRes, brRes, cRes] = await Promise.all([
        batchesAPI.listBatches({ limit: 500 }),
        listDivisions({ limit: 500 }),
        listBranches({ limit: 500 }),
        listCourses({ limit: 500 }),
      ])
      setBatches(bRes.data || bRes || [])
      setDivisions(Array.isArray(dRes) ? dRes : dRes?.data || [])
      setBranches(Array.isArray(brRes) ? brRes : brRes?.data || [])
      setCourses(Array.isArray(cRes) ? cRes : cRes?.data || [])
    } catch { toast.error('Failed to load data') }
    finally { setLoading(false) }
  }

  const validateForm = () => {
    const errs = {}
    if (!formData.name?.trim()) errs.name = 'Batch name is required'
    if (!formData.course_id) errs.course_id = 'Course is required'
    if (!formData.branch_id) errs.branch_id = 'Branch is required'
    if (!formData.division_id) errs.division_id = 'Division is required'
    if (!formData.academic_year?.trim()) errs.academic_year = 'Academic year is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    const payload = {
      name: formData.name.trim(),
      division_id: parseInt(formData.division_id),
      batch_number: parseInt(formData.batch_number),
      semester: parseInt(formData.semester),
      academic_year: formData.academic_year.trim(),
    }
    try {
      if (editingId) { await batchesAPI.updateBatch(editingId, payload); toast.success('Batch updated') }
      else { await batchesAPI.createBatch(payload); toast.success('Batch created') }
      closeModal(); fetchAll()
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this batch?')) return
    try { await batchesAPI.deleteBatch(id); toast.success('Batch deleted'); fetchAll() }
    catch { toast.error('Failed to delete') }
  }

  const openEdit = (b) => {
    const division = divisions.find(d => d.id === b.division_id)
    const branch = branches.find(br => br.id === division?.branch_id)
    setEditingId(b.id)
    setFormData({ 
      name: b.name || '', 
      course_id: branch?.course_id ? String(branch.course_id) : '',
      branch_id: division?.branch_id ? String(division.branch_id) : '',
      division_id: b.division_id ? String(b.division_id) : '',
      batch_number: String(b.batch_number || 1), 
      semester: String(b.semester || 1), 
      academic_year: b.academic_year || '2025-2026' 
    })
    setErrors({}); setIsModalOpen(true)
  }

  const closeModal = () => { setIsModalOpen(false); setEditingId(null); setFormData(EMPTY_FORM); setErrors({}) }

  const handleCourseChange = (e) => setFormData(prev => ({ ...prev, course_id: e.target.value, branch_id: '', division_id: '' }))
  const handleBranchChange = (e) => setFormData(prev => ({ ...prev, branch_id: e.target.value, division_id: '' }))

  const filtered = batches.filter(b => b.name?.toLowerCase().includes(search.toLowerCase()))
  
  const filteredBranches = branches.filter(br => !formData.course_id || br.course_id === parseInt(formData.course_id))
  const filteredDivisions = divisions.filter(d => !formData.branch_id || d.branch_id === parseInt(formData.branch_id))

  const courseOptions = [{ label: 'Select a course...', value: '' }, ...courses.map(c => ({ label: `${c.name} (${c.code})`, value: c.id }))]
  const branchOptions = [{ label: 'Select a branch...', value: '' }, ...filteredBranches.map(br => ({ label: `${br.name} (${br.code})`, value: br.id }))]
  const divOptions = [{ label: 'Select a division...', value: '' }, ...filteredDivisions.map(d => ({ label: `${d.name} (Year ${d.year}, Sem ${d.semester})`, value: d.id }))]

  if (loading && batches.length === 0) return <Loading />

  return (
    <div className="page-inner">
      <div className="page-header">
        <div><h1 className="page-title"><Layers className="page-title-icon" />Batches</h1><p className="page-subtitle">Manage student cohorts and groups</p></div>
        <Button variant="primary" onClick={() => { setEditingId(null); setFormData(EMPTY_FORM); setErrors({}); setIsModalOpen(true) }}>
          <Plus size={18} />Add Batch
        </Button>
      </div>
      <Card>
        <CardHeader>
          <div className="search-box"><Search size={18} className="search-icon" /><input type="text" placeholder="Search batches..." value={search} onChange={e => setSearch(e.target.value)} className="search-input" /></div>
          <span className="badge">{filtered.length} batches</span>
        </CardHeader>
        <CardBody>
          {loading ? <Loading /> : filtered.length === 0 ? (
            <div className="empty-state"><Layers size={48} /><p>No batches found</p></div>
          ) : (
            <div className="crud-table">
              <table><thead><tr><th>Batch Name</th><th>Course</th><th>Branch</th><th>Division</th><th>Batch #</th><th>Semester</th><th>Actions</th></tr></thead>
              <tbody>{filtered.map(b => {
                const division = divisions.find(d => d.id === b.division_id)
                const branch = branches.find(br => br.id === division?.branch_id)
                const course = courses.find(c => c.id === branch?.course_id)
                return (
                  <tr key={b.id}>
                    <td className="item-name">{b.name}</td>
                    <td>{course?.name || '—'}</td>
                    <td>{branch?.name || '—'}</td>
                    <td>{division?.name || '—'}</td>
                    <td>Batch {b.batch_number}</td>
                    <td>Sem {b.semester}</td>
                    <td><div className="action-btns"><button className="icon-btn edit" onClick={() => openEdit(b)}><Edit2 size={15} /></button><button className="icon-btn delete" onClick={() => handleDelete(b.id)}><Trash2 size={15} /></button></div></td>
                  </tr>
                )
              })}</tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal--md" onClick={e => e.stopPropagation()}>
            <div className="modal__header"><h2 className="modal__title">{editingId ? 'Edit Batch' : 'Add New Batch'}</h2><button className="modal__close" onClick={closeModal}><X size={20} /></button></div>
            <form onSubmit={handleSubmit} className="modal__body crud-form">
              <div className="form-grid">
                <Input label="Batch Name *" name="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} error={errors.name} placeholder="e.g. Morning Batch, Practical Group A" />
                <Select label="Course *" name="course_id" value={formData.course_id} onChange={handleCourseChange} options={courseOptions} error={errors.course_id} />
                <Select label="Branch *" name="branch_id" value={formData.branch_id} onChange={handleBranchChange} options={branchOptions} error={errors.branch_id} disabled={!formData.course_id} />
                <Select label="Division *" name="division_id" value={formData.division_id} onChange={e => setFormData({ ...formData, division_id: e.target.value })} options={divOptions} error={errors.division_id} disabled={!formData.branch_id} />
                <Input label="Batch Number *" name="batch_number" type="number" value={formData.batch_number} onChange={e => setFormData({ ...formData, batch_number: e.target.value })} min="1" />
                <Input label="Semester *" name="semester" type="number" value={formData.semester} onChange={e => setFormData({ ...formData, semester: e.target.value })} min="1" />
                <Input label="Academic Year *" name="academic_year" value={formData.academic_year} onChange={e => setFormData({ ...formData, academic_year: e.target.value })} error={errors.academic_year} placeholder="e.g. 2025-2026" />
              </div>
              <div className="modal__footer"><Button variant="secondary" onClick={closeModal} type="button">Cancel</Button><Button variant="primary" type="submit"><Check size={16} />{editingId ? 'Update' : 'Create'}</Button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
