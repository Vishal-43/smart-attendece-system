import { useState, useEffect } from 'react'
import { Card, CardHeader, CardBody, Button, Input, Loading, Select } from '../../components/Common'
import { useToast } from '../../hooks/useToast'
import { enrollmentsAPI } from '../../api/endpoints'
import { listCourses, listBranches, listDivisions, listBatches } from '../../api/services'
import { usersAPI } from '../../api/endpoints'
import { UserCheck, Plus, Edit2, Trash2, Search, X, Check } from 'lucide-react'
import './ManagementPages.css'

const EMPTY_FORM = {
  student_id: '', course_id: '', branch_id: '', division_id: '', batch_id: '',
  current_year: '1', current_semester: '1',
  enrollment_number: '', enrollment_date: '',
  academic_year: '2025-2026', status: 'active', has_kt: false,
}

const YEAR_OPTIONS = [
  { label: 'Year I', value: '1' }, { label: 'Year II', value: '2' },
  { label: 'Year III', value: '3' }, { label: 'Year IV', value: '4' },
]

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Dropout', value: 'dropout' },
  { label: 'Graduated', value: 'graduated' },
]

const SEM_OPTIONS = Array.from({ length: 8 }, (_, i) => ({ label: `Semester ${i + 1}`, value: String(i + 1) }))

export default function EnrollmentsPage() {
  const toast = useToast()
  const [enrollments, setEnrollments] = useState([])
  const [courses, setCourses] = useState([])
  const [branches, setBranches] = useState([])
  const [divisions, setDivisions] = useState([])
  const [batches, setBatches] = useState([])
  const [students, setStudents] = useState([])
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
      const [eRes, cRes, bRes, dRes, baRes, sRes] = await Promise.all([
        enrollmentsAPI.listEnrollments({ limit: 500 }),
        listCourses({ limit: 500 }),
        listBranches({ limit: 500 }),
        listDivisions({ limit: 500 }),
        listBatches({ limit: 500 }),
        usersAPI.listUsers({ role: 'student', limit: 500 }),
      ])
      setEnrollments(eRes.data || eRes || [])
      setCourses(Array.isArray(cRes) ? cRes : cRes?.data || [])
      setBranches(Array.isArray(bRes) ? bRes : bRes?.data || [])
      setDivisions(Array.isArray(dRes) ? dRes : dRes?.data || [])
      setBatches(Array.isArray(baRes) ? baRes : baRes?.data || [])
      setStudents(Array.isArray(sRes) ? sRes : sRes?.data || [])
    } catch { toast.error('Failed to load data') }
    finally { setLoading(false) }
  }

  const validateForm = () => {
    const errs = {}
    if (!formData.student_id) errs.student_id = 'Student is required'
    if (!formData.course_id) errs.course_id = 'Course is required'
    if (!formData.branch_id) errs.branch_id = 'Branch is required'
    if (!formData.division_id) errs.division_id = 'Division is required'
    if (!formData.enrollment_number?.trim()) errs.enrollment_number = 'Enrollment number is required'
    if (!formData.enrollment_date) errs.enrollment_date = 'Enrollment date is required'
    if (!formData.academic_year?.trim()) errs.academic_year = 'Academic year is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    const payload = {
      student_id: parseInt(formData.student_id),
      course_id: parseInt(formData.course_id),
      branch_id: parseInt(formData.branch_id),
      division_id: parseInt(formData.division_id),
      current_year: parseInt(formData.current_year),
      current_semester: parseInt(formData.current_semester),
      enrollment_number: formData.enrollment_number.trim(),
      enrollment_date: formData.enrollment_date,
      academic_year: formData.academic_year.trim(),
      status: formData.status,
      has_kt: formData.has_kt,
    }
    try {
      if (editingId) { await enrollmentsAPI.updateEnrollment(editingId, payload); toast.success('Enrollment updated') }
      else { await enrollmentsAPI.createEnrollment(payload); toast.success('Enrollment created') }
      closeModal(); fetchAll()
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this enrollment?')) return
    try { await enrollmentsAPI.deleteEnrollment(id); toast.success('Deleted'); fetchAll() }
    catch { toast.error('Failed to delete') }
  }

  const openEdit = (en) => {
    setEditingId(en.id)
    setFormData({
      student_id: en.student_id || '', course_id: en.course_id || '',
      branch_id: en.branch_id || '', division_id: en.division_id || '', batch_id: en.batch_id || '',
      current_year: String(en.current_year || 1), current_semester: String(en.current_semester || 1),
      enrollment_number: en.enrollment_number || '', enrollment_date: en.enrollment_date || '',
      academic_year: en.academic_year || '2025-2026',
      status: en.status || 'active', has_kt: en.has_kt || false,
    })
    setErrors({}); setIsModalOpen(true)
  }

  const closeModal = () => { setIsModalOpen(false); setEditingId(null); setFormData(EMPTY_FORM); setErrors({}) }

  const filtered = enrollments.filter(en =>
    en.enrollment_number?.toLowerCase().includes(search.toLowerCase()) ||
    students.find(s => s.id === en.student_id)?.username?.toLowerCase().includes(search.toLowerCase())
  )

  const filteredBranches = branches.filter(b => !formData.course_id || b.course_id === parseInt(formData.course_id))
  const filteredDivisions = divisions.filter(d => !formData.branch_id || d.branch_id === parseInt(formData.branch_id))
  const filteredBatches = batches.filter(b => !formData.division_id || b.division_id === parseInt(formData.division_id))

  const courseOptions = [{ label: 'Select course...', value: '' }, ...courses.map(c => ({ label: `${c.name} (${c.code})`, value: c.id }))]
  const branchOptions = [{ label: 'Select branch...', value: '' }, ...filteredBranches.map(b => ({ label: `${b.name}`, value: b.id }))]
  const divOptions = [{ label: 'Select division...', value: '' }, ...filteredDivisions.map(d => ({ label: `${d.name} (Year ${d.year}, Sem ${d.semester})`, value: d.id }))]
  const batchOptions = [{ label: 'Select batch (optional)...', value: '' }, ...filteredBatches.map(b => ({ label: `${b.name}`, value: b.id }))]
  const studentOptions = [{ label: 'Select student...', value: '' }, ...students.map(s => ({ label: `${s.username} (${s.email})`, value: s.id }))]

  const handleCourseChange = (e) => setFormData(prev => ({ ...prev, course_id: e.target.value, branch_id: '', division_id: '', batch_id: '' }))
  const handleBranchChange = (e) => setFormData(prev => ({ ...prev, branch_id: e.target.value, division_id: '', batch_id: '' }))
  const handleDivisionChange = (e) => setFormData(prev => ({ ...prev, division_id: e.target.value, batch_id: '' }))

  if (loading && enrollments.length === 0) return <Loading />

  return (
    <div className="page-inner">
      <div className="page-header">
        <div><h1 className="page-title"><UserCheck className="page-title-icon" />Enrollments</h1><p className="page-subtitle">Manage student course enrollments</p></div>
        <Button variant="primary" onClick={() => { setEditingId(null); setFormData(EMPTY_FORM); setErrors({}); setIsModalOpen(true) }}>
          <Plus size={18} />Add Enrollment
        </Button>
      </div>
      <Card>
        <CardHeader>
          <div className="search-box"><Search size={18} className="search-icon" /><input type="text" placeholder="Search by enrollment number or student..." value={search} onChange={e => setSearch(e.target.value)} className="search-input" /></div>
          <span className="badge">{filtered.length} enrollments</span>
        </CardHeader>
        <CardBody>
          {loading ? <Loading /> : filtered.length === 0 ? (
            <div className="empty-state"><UserCheck size={48} /><p>No enrollments found</p></div>
          ) : (
            <div className="crud-table">
              <table><thead><tr><th>Enrollment #</th><th>Student</th><th>Course</th><th>Year/Sem</th><th>Academic Year</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>{filtered.map(en => (
                <tr key={en.id}>
                  <td className="item-name"><span className="code-badge">{en.enrollment_number}</span></td>
                  <td>{students.find(s => s.id === en.student_id)?.username || `Student #${en.student_id}`}</td>
                  <td>{courses.find(c => c.id === en.course_id)?.name || `Course #${en.course_id}`}</td>
                  <td>{en.current_year} / Sem {en.current_semester}</td>
                  <td>{en.academic_year}</td>
                  <td><span className={`status-pill ${(en.status || '').toLowerCase()}`}>{en.status || 'N/A'}</span></td>
                  <td><div className="action-btns"><button className="icon-btn edit" onClick={() => openEdit(en)}><Edit2 size={15} /></button><button className="icon-btn delete" onClick={() => handleDelete(en.id)}><Trash2 size={15} /></button></div></td>
                </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal--lg" onClick={e => e.stopPropagation()}>
            <div className="modal__header"><h2 className="modal__title">{editingId ? 'Edit Enrollment' : 'Add New Enrollment'}</h2><button className="modal__close" onClick={closeModal}><X size={20} /></button></div>
            <form onSubmit={handleSubmit} className="modal__body crud-form">
              <div className="form-grid">
                <Select label="Student *" name="student_id" value={formData.student_id} onChange={e => setFormData({ ...formData, student_id: e.target.value })} options={studentOptions} error={errors.student_id} />
                <Select label="Course *" name="course_id" value={formData.course_id} onChange={handleCourseChange} options={courseOptions} error={errors.course_id} />
                <Select label="Branch *" name="branch_id" value={formData.branch_id} onChange={handleBranchChange} options={branchOptions} error={errors.branch_id} disabled={!formData.course_id} />
                <Select label="Division *" name="division_id" value={formData.division_id} onChange={handleDivisionChange} options={divOptions} error={errors.division_id} disabled={!formData.branch_id} />
                <Select label="Batch (Optional)" name="batch_id" value={formData.batch_id} onChange={e => setFormData({ ...formData, batch_id: e.target.value })} options={batchOptions} disabled={!formData.division_id} />
                <Input label="Enrollment Number *" name="enrollment_number" value={formData.enrollment_number} onChange={e => setFormData({ ...formData, enrollment_number: e.target.value })} error={errors.enrollment_number} placeholder="e.g. ENR001" />
                <Input label="Enrollment Date *" name="enrollment_date" type="date" value={formData.enrollment_date} onChange={e => setFormData({ ...formData, enrollment_date: e.target.value })} error={errors.enrollment_date} />
                <Select label="Current Year *" name="current_year" value={formData.current_year} onChange={e => setFormData({ ...formData, current_year: e.target.value })} options={YEAR_OPTIONS} />
                <Select label="Current Semester *" name="current_semester" value={formData.current_semester} onChange={e => setFormData({ ...formData, current_semester: e.target.value })} options={SEM_OPTIONS} />
                <Input label="Academic Year *" name="academic_year" value={formData.academic_year} onChange={e => setFormData({ ...formData, academic_year: e.target.value })} error={errors.academic_year} placeholder="e.g. 2025-2026" />
                <Select label="Status *" name="status" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} options={STATUS_OPTIONS} />
                <label className="toggle-label"><input type="checkbox" checked={formData.has_kt} onChange={e => setFormData({ ...formData, has_kt: e.target.checked })} /><span className="toggle-text">Has KT (Kept Terms)</span></label>
              </div>
              <div className="modal__footer"><Button variant="secondary" onClick={closeModal} type="button">Cancel</Button><Button variant="primary" type="submit"><Check size={16} />{editingId ? 'Update' : 'Create'}</Button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
