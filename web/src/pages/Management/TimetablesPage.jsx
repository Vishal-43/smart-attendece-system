// TimetablesPage.jsx - Enterprise Professional Timetable Management
import { useState, useEffect } from 'react'
import { Card, CardHeader, CardBody, Button, Loading, Select } from '../../components/Common'
import { useToast } from '../../hooks/useToast'
import { timetablesAPI, usersAPI } from '../../api/endpoints'
import { listDivisions, listLocations, listBranches, listCourses, listBatches, listSubjects } from '../../api/services'
import { Calendar, Plus, Edit2, Trash2, Search, X, Clock, MapPin, User, BookOpen } from 'lucide-react'
import './ManagementPages.css'

const EMPTY_FORM = {
  course_id: '', branch_id: '', division_id: '', subject_id: '',
  teacher_id: '', location_id: '',
  lecture_type: 'THEORY', batch_id: '', day_of_week: 'MON',
  start_time: '09:00', end_time: '10:00',
  semester: '1', academic_year: '2025-2026', is_active: true,
}

const DAY_OPTIONS = [
  { label: 'Monday', value: 'MON' }, { label: 'Tuesday', value: 'TUE' },
  { label: 'Wednesday', value: 'WED' }, { label: 'Thursday', value: 'THU' },
  { label: 'Friday', value: 'FRI' }, { label: 'Saturday', value: 'SAT' },
]

const LECTURE_TYPE_OPTIONS = [
  { label: 'Theory', value: 'THEORY' },
  { label: 'Practical', value: 'PRACTICAL' },
  { label: 'Tutorial', value: 'TUTORIAL' },
]

export default function TimetablesPage() {
  const toast = useToast()
  const [timetables, setTimetables] = useState([])
  const [courses, setCourses] = useState([])
  const [branches, setBranches] = useState([])
  const [divisions, setDivisions] = useState([])
  const [batches, setBatches] = useState([])
  const [subjects, setSubjects] = useState([])
  const [locations, setLocations] = useState([])
  const [teachers, setTeachers] = useState([])
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
      const [ttRes, cRes, bRes, dRes, baRes, sRes, locRes, tRes] = await Promise.all([
        timetablesAPI.listTimetables({ limit: 500 }),
        listCourses({ limit: 500 }),
        listBranches({ limit: 500 }),
        listDivisions({ limit: 500 }),
        listBatches({ limit: 500 }),
        listSubjects({ limit: 500 }),
        listLocations({ limit: 500 }),
        usersAPI.listUsers({ role: 'teacher', limit: 500 }),
      ])
      // Handle both unwrapped (services.js) and wrapped (endpoints.js) responses
      const ttData = ttRes?.data?.data || ttRes?.data || ttRes || []
      const teachersData = tRes?.data?.data || tRes?.data || tRes || []
      
      setTimetables(Array.isArray(ttData) ? ttData : [])
      setCourses(Array.isArray(cRes) ? cRes : [])
      setBranches(Array.isArray(bRes) ? bRes : [])
      setDivisions(Array.isArray(dRes) ? dRes : [])
      setBatches(Array.isArray(baRes) ? baRes : [])
      setSubjects(Array.isArray(sRes) ? sRes : [])
      setLocations(Array.isArray(locRes) ? locRes : [])
      setTeachers(Array.isArray(teachersData) ? teachersData : [])
    } catch (err) { 
      console.error('Failed to load data:', err)
      toast.error('Failed to load data: ' + (err.response?.data?.detail || err.message)) 
    }
    finally { setLoading(false) }
  }

  const validateForm = () => {
    const errs = {}
    if (!formData.course_id) errs.course_id = 'Course is required'
    if (!formData.branch_id) errs.branch_id = 'Branch is required'
    if (!formData.division_id) errs.division_id = 'Division is required'
    if (!formData.subject_id) errs.subject_id = 'Subject is required'
    if (!formData.teacher_id) errs.teacher_id = 'Teacher is required'
    if (!formData.location_id) errs.location_id = 'Location is required'
    if (!formData.start_time) errs.start_time = 'Start time is required'
    if (!formData.end_time) errs.end_time = 'End time is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    const payload = {
      division_id: parseInt(formData.division_id),
      teacher_id: parseInt(formData.teacher_id),
      location_id: parseInt(formData.location_id),
      subject_id: parseInt(formData.subject_id),
      lecture_type: formData.lecture_type,
      batch_id: formData.lecture_type === 'PRACTICAL' && formData.batch_id ? parseInt(formData.batch_id) : undefined,
      day_of_week: formData.day_of_week,
      start_time: formData.start_time,
      end_time: formData.end_time,
      semester: parseInt(formData.semester),
      academic_year: formData.academic_year.trim(),
      is_active: formData.is_active,
    }
    try {
      if (editingId) { await timetablesAPI.updateTimetable(editingId, payload); toast.success('Timetable updated') }
      else { await timetablesAPI.createTimetable(payload); toast.success('Timetable created') }
      closeModal(); fetchAll()
    } catch (err) { toast.error(err.response?.data?.detail || 'Operation failed') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this timetable entry?')) return
    try { await timetablesAPI.deleteTimetable(id); toast.success('Deleted'); fetchAll() }
    catch { toast.error('Failed to delete') }
  }

  const openEdit = (t) => {
    const division = divisions.find(d => d.id === t.division_id)
    const branch = branches.find(b => b.id === division?.branch_id)
    const course = courses.find(c => c.id === branch?.course_id)
    setFormData({
      course_id: course?.id || '', branch_id: branch?.id || '', division_id: t.division_id || '',
      subject_id: t.subject_id || '', teacher_id: t.teacher_id || '',
      location_id: t.location_id || '',
      lecture_type: (t.lecture_type || 'THEORY').toUpperCase(), batch_id: t.batch_id || '',
      day_of_week: (t.day_of_week || 'MON').toUpperCase(),
      start_time: t.start_time?.substring(0, 5) || '09:00',
      end_time: t.end_time?.substring(0, 5) || '10:00',
      semester: String(t.semester || 1), academic_year: t.academic_year || '2025-2026',
      is_active: t.is_active !== false,
    })
    setEditingId(t.id)
    setErrors({}); setIsModalOpen(true)
  }

  const closeModal = () => { setIsModalOpen(false); setEditingId(null); setFormData(EMPTY_FORM); setErrors({}) }

  const handleCourseChange = (e) => {
    const newCourseId = e.target.value
    setFormData(prev => ({ ...prev, course_id: newCourseId, branch_id: '', division_id: '', subject_id: '' }))
  }

  const handleBranchChange = (e) => {
    const newBranchId = e.target.value
    setFormData(prev => ({ ...prev, branch_id: newBranchId, division_id: '', subject_id: '' }))
  }

  const handleDivisionChange = (e) => {
    const newDivId = e.target.value
    setFormData(prev => ({ ...prev, division_id: newDivId, subject_id: '' }))
  }

  const filteredBranches = branches.filter(b => !formData.course_id || b.course_id === parseInt(formData.course_id))
  const filteredDivisions = divisions.filter(d => !formData.branch_id || d.branch_id === parseInt(formData.branch_id))
  const filteredSubjects = subjects.filter(s => !formData.branch_id || s.branch_id === parseInt(formData.branch_id))
  const filteredBatches = batches.filter(b => !formData.division_id || b.division_id === parseInt(formData.division_id))

  const courseOptions = [{ label: 'Select course...', value: '' }, ...courses.map(c => ({ label: `${c.name} (${c.code})`, value: c.id }))]
  const branchOptions = [{ label: 'Select branch...', value: '' }, ...filteredBranches.map(b => ({ label: `${b.name} (${b.code})`, value: b.id }))]
  const divisionOptions = [{ label: 'Select division...', value: '' }, ...filteredDivisions.map(d => ({ label: `${d.name} (Year ${d.year}, Sem ${d.semester})`, value: d.id }))]
  const subjectOptions = [{ label: 'Select subject...', value: '' }, ...filteredSubjects.map(s => ({ label: `${s.name} (${s.code})`, value: s.id }))]
  const batchOptions = [{ label: 'Select batch...', value: '' }, ...filteredBatches.map(b => ({ label: `${b.name}`, value: b.id }))]
  const locationOptions = [{ label: 'Select location...', value: '' }, ...locations.map(l => ({ label: `${l.name}${l.room_no ? ` (${l.room_no})` : ''}`, value: l.id }))]
  const teacherOptions = [{ label: 'Select teacher...', value: '' }, ...teachers.map(t => ({ label: `${t.username} (${t.email})`, value: t.id }))]

  const filtered = timetables.filter(t => 
    t.subject_name?.toLowerCase().includes(search.toLowerCase()) ||
    t.day_of_week?.toLowerCase().includes(search.toLowerCase())
  )

  const getSubjectName = (id) => subjects.find(s => s.id === id)?.name || `Subject #${id}`
  const getDivisionName = (id) => divisions.find(d => d.id === id)?.name || `Div #${id}`
  const getTeacherName = (id) => teachers.find(t => t.id === id)?.username || `Teacher #${id}`
  const getLocationName = (id) => locations.find(l => l.id === id)?.name || `Loc #${id}`

  const getLectureBadge = (type) => {
    const styles = {
      theory: { bg: 'var(--info-bg)', color: 'var(--info-text)', border: 'var(--info-border)' },
      practical: { bg: 'var(--purple-bg)', color: 'var(--purple-text)', border: 'var(--purple-text)' },
      tutorial: { bg: 'var(--warning-bg)', color: 'var(--warning-text)', border: 'var(--warning-border)' },
    }
    const s = styles[type] || styles.theory
    return (
      <span className="type-badge" style={{ background: s.bg, color: s.color, borderColor: s.border }}>
        {type}
      </span>
    )
  }

  return (
    <div className="page-inner">
      <div className="mgt-header">
        <div className="mgt-header__left">
          <h1 className="page-title"><Calendar size={20} />Timetables</h1>
          <p className="page-subtitle">Manage class schedules and timetables</p>
        </div>
        <div className="mgt-header__right">
          <Button variant="primary" onClick={() => { setEditingId(null); setFormData(EMPTY_FORM); setErrors({}); setIsModalOpen(true) }}>
            <Plus size={18} /> Add Timetable
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input type="text" placeholder="Search by subject..." value={search} onChange={e => setSearch(e.target.value)} className="search-input" />
          </div>
          <span className="page-count-badge">{filtered.length} entries</span>
        </CardHeader>
        <CardBody>
          {loading ? (
            <Loading />
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <Calendar size={44} className="empty-state__icon" />
              <p className="empty-state__text">No timetable entries found</p>
            </div>
          ) : (
            <div className="crud-table">
              <table>
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Day</th>
                    <th>Time</th>
                    <th>Division</th>
                    <th>Location</th>
                    <th>Teacher</th>
                    <th>Type</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(t => (
                    <tr key={t.id}>
                      <td className="item-name">{t.subject_name || getSubjectName(t.subject_id)}</td>
                      <td>{t.day_of_week}</td>
                      <td>
                        <div className="table-cell-icon">
                          <Clock size={14} />
                          <span>{t.start_time?.substring(0, 5)} - {t.end_time?.substring(0, 5)}</span>
                        </div>
                      </td>
                      <td>{getDivisionName(t.division_id)}</td>
                      <td>
                        <div className="table-cell-icon">
                          <MapPin size={14} />
                          <span>{getLocationName(t.location_id)}</span>
                        </div>
                      </td>
                      <td>
                        <div className="table-cell-icon">
                          <User size={14} />
                          <span>{getTeacherName(t.teacher_id)}</span>
                        </div>
                      </td>
                      <td>{getLectureBadge(t.lecture_type || 'THEORY')}</td>
                      <td>
                        <div className="actions" style={{ justifyContent: 'flex-end' }}>
                          <button className="icon-btn icon-btn--edit" onClick={() => openEdit(t)} title="Edit">
                            <Edit2 size={14} />
                          </button>
                          <button className="icon-btn icon-btn--delete" onClick={() => handleDelete(t.id)} title="Delete">
                            <Trash2 size={14} />
                          </button>
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
          <div className="modal modal--lg" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">{editingId ? 'Edit Timetable' : 'Add Timetable'}</h2>
              <button className="modal__close" onClick={closeModal}><X size={20} /></button>
            </div>
            <div className="modal__body">
              <form onSubmit={handleSubmit} className="crud-form">
                <div className="form-section-title">Cascade Selection</div>
                <div className="form-grid">
                  <Select label="Course *" name="course_id" value={formData.course_id} onChange={handleCourseChange} options={courseOptions} error={errors.course_id} />
                  <Select label="Branch *" name="branch_id" value={formData.branch_id} onChange={handleBranchChange} options={branchOptions} error={errors.branch_id} disabled={!formData.course_id} />
                </div>
                <div className="form-grid">
                  <Select label="Division *" name="division_id" value={formData.division_id} onChange={handleDivisionChange} options={divisionOptions} error={errors.division_id} disabled={!formData.branch_id} />
                  <Select label="Subject *" name="subject_id" value={formData.subject_id} onChange={e => setFormData({ ...formData, subject_id: e.target.value })} options={subjectOptions} error={errors.subject_id} disabled={!formData.division_id} />
                </div>
                <div className="form-section-title">Schedule Details</div>
                <div className="form-grid">
                  <Select label="Day *" name="day_of_week" value={formData.day_of_week} onChange={e => setFormData({ ...formData, day_of_week: e.target.value })} options={DAY_OPTIONS} />
                  <Select label="Lecture Type *" name="lecture_type" value={formData.lecture_type} onChange={e => setFormData({ ...formData, lecture_type: e.target.value })} options={LECTURE_TYPE_OPTIONS} />
                </div>
                {formData.lecture_type === 'PRACTICAL' && (
                  <div className="form-grid">
                    <Select label="Batch *" name="batch_id" value={formData.batch_id} onChange={e => setFormData({ ...formData, batch_id: e.target.value })} options={batchOptions} error={errors.batch_id} />
                    <div />
                  </div>
                )}
                <div className="form-grid">
                  <div className="form-input-wrap">
                    <label className="form-input-label">Start Time *</label>
                    <input type="time" className="form-input" value={formData.start_time} onChange={e => setFormData({ ...formData, start_time: e.target.value })} />
                  </div>
                  <div className="form-input-wrap">
                    <label className="form-input-label">End Time *</label>
                    <input type="time" className="form-input" value={formData.end_time} onChange={e => setFormData({ ...formData, end_time: e.target.value })} />
                  </div>
                </div>
                <div className="form-section-title">Assignment</div>
                <div className="form-grid">
                  <Select label="Teacher *" name="teacher_id" value={formData.teacher_id} onChange={e => setFormData({ ...formData, teacher_id: e.target.value })} options={teacherOptions} error={errors.teacher_id} />
                  <Select label="Location *" name="location_id" value={formData.location_id} onChange={e => setFormData({ ...formData, location_id: e.target.value })} options={locationOptions} error={errors.location_id} />
                </div>
                <div className="form-grid">
                  <div className="form-input-wrap">
                    <label className="form-input-label">Semester</label>
                    <input type="number" className="form-input" value={formData.semester} onChange={e => setFormData({ ...formData, semester: e.target.value })} min="1" />
                  </div>
                  <div className="form-input-wrap">
                    <label className="form-input-label">Academic Year</label>
                    <input type="text" className="form-input" value={formData.academic_year} onChange={e => setFormData({ ...formData, academic_year: e.target.value })} placeholder="e.g. 2025-2026" />
                  </div>
                </div>
                <label className="toggle-label">
                  <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
                  <span>Active</span>
                </label>
                <div className="modal-footer">
                  <Button variant="secondary" type="button" onClick={closeModal}>Cancel</Button>
                  <Button variant="primary" type="submit">{editingId ? 'Update' : 'Create'}</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}