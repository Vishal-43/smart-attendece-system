import { useState, useEffect } from 'react'
import { Card, CardHeader, CardBody, Button, Input, Loading, Select } from '../../components/Common'
import { useToast } from '../../hooks/useToast'
import { accessPointsAPI } from '../../api/endpoints'
import { listLocations } from '../../api/services'
import { Wifi, Plus, Edit2, Trash2, Search, X, Check, Server, Link } from 'lucide-react'
import './AccessPointsPage.css'

const EMPTY_FORM = {
  name: '',
  mac_address: '',
  ip_address: '',
  location_id: '',
  is_active: true,
}

export default function AccessPointsPage() {
  const toast = useToast()
  const [accessPoints, setAccessPoints] = useState([])
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [fetchingNetwork, setFetchingNetwork] = useState(false)

  useEffect(() => { fetchAll() }, [])

  const fetchFromNetwork = async () => {
    setFetchingNetwork(true)
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      setFormData(prev => ({ ...prev, ip_address: data.ip }))
      toast.success('IP address fetched: ' + data.ip)
    } catch {
      toast.error('Failed to fetch IP address')
    } finally {
      setFetchingNetwork(false)
    }
  }

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [apRes, locRes] = await Promise.all([
        accessPointsAPI.listAccessPoints({ limit: 500 }),
        listLocations({ limit: 500 }),
      ])
      setAccessPoints(apRes.data || apRes || [])
      setLocations(Array.isArray(locRes) ? locRes : locRes?.data || [])
    } catch {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const errs = {}
    if (!formData.name.trim()) errs.name = 'Name is required'
    if (!formData.mac_address.trim()) errs.mac_address = 'MAC address is required'
    if (formData.mac_address && !/^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/.test(formData.mac_address)) {
      errs.mac_address = 'Invalid MAC address format (e.g. AA:BB:CC:DD:EE:FF)'
    }
    if (formData.ip_address && !/^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/.test(formData.ip_address)) {
      errs.ip_address = 'Invalid IP address format'
    }
    if (!formData.location_id) errs.location_id = 'Location is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    const payload = {
      name: formData.name.trim(),
      mac_address: formData.mac_address.trim().toUpperCase(),
      ip_address: formData.ip_address || undefined,
      location_id: parseInt(formData.location_id),
      is_active: formData.is_active,
    }
    try {
      if (editingId) {
        await accessPointsAPI.updateAccessPoint(editingId, payload)
        toast.success('Access point updated')
      } else {
        await accessPointsAPI.createAccessPoint(payload)
        toast.success('Access point created')
      }
      closeModal()
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this access point? This cannot be undone.')) return
    try {
      await accessPointsAPI.deleteAccessPoint(id)
      toast.success('Access point deleted')
      fetchAll()
    } catch {
      toast.error('Failed to delete')
    }
  }

  const openCreate = () => {
    setEditingId(null)
    setFormData(EMPTY_FORM)
    setErrors({})
    setIsModalOpen(true)
  }

  const openEdit = (ap) => {
    setEditingId(ap.id)
    setFormData({
      name: ap.name || '',
      mac_address: ap.mac_address || '',
      ip_address: ap.ip_address || '',
      location_id: ap.location_id || '',
      is_active: ap.is_active !== false,
    })
    setErrors({})
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setFormData(EMPTY_FORM)
    setErrors({})
  }

  const filtered = accessPoints.filter(ap =>
    ap.name?.toLowerCase().includes(search.toLowerCase()) ||
    ap.mac_address?.toLowerCase().includes(search.toLowerCase()) ||
    ap.ip_address?.toLowerCase().includes(search.toLowerCase()) ||
    ap.location_name?.toLowerCase().includes(search.toLowerCase())
  )

  const locationOptions = [
    { label: 'Select a location...', value: '' },
    ...locations.map(l => ({ label: `${l.name}${l.room_no ? ` (${l.room_no})` : ''}`, value: l.id }))
  ]

  if (loading && accessPoints.length === 0) return <Loading />

  return (
    <div className="page-inner">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Wifi className="page-title-icon" />
            Access Points
          </h1>
          <p className="page-subtitle">Manage WiFi access points linked to locations</p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          <Plus size={16} /> Add Access Point
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, MAC, IP, or location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
          <span className="badge">{filtered.length} access points</span>
        </CardHeader>
        <CardBody>
          {loading ? (
            <Loading />
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <Server size={48} />
              <p>No access points found</p>
              <Button variant="primary" onClick={openCreate} size="sm">
                <Plus size={16} /> Add your first access point
              </Button>
            </div>
          ) : (
            <div className="ap-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>MAC Address</th>
                    <th>IP Address</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(ap => (
                    <tr key={ap.id}>
                      <td className="ap-name">
                        <Server size={15} className="ap-icon" />
                        {ap.name}
                      </td>
                      <td className="mono-text">{ap.mac_address}</td>
                      <td className="mono-text">{ap.ip_address || '—'}</td>
                      <td>
                        {ap.location_name ? (
                          <span className="location-link">
                            <Link size={12} />
                            {ap.location_name}
                          </span>
                        ) : '—'}
                      </td>
                      <td>
                        <span className={`status-pill ${ap.is_active ? 'active' : 'inactive'}`}>
                          <span className="status-dot" />
                          {ap.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button className="icon-btn icon-btn--edit" onClick={() => openEdit(ap)} title="Edit">
                            <Edit2 size={14} />
                          </button>
                          <button className="icon-btn icon-btn--delete" onClick={() => handleDelete(ap.id)} title="Delete">
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
          <div className="modal modal--md" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">{editingId ? 'Edit Access Point' : 'Add New Access Point'}</h2>
              <button className="modal__close" onClick={closeModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal__body ap-form">
              <Input
                label="Access Point Name *"
                name="name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                error={errors.name}
                placeholder="e.g. Router Room 301, AP Floor 3"
              />
              <Input
                label="MAC Address *"
                name="mac_address"
                value={formData.mac_address}
                onChange={e => setFormData({ ...formData, mac_address: e.target.value })}
                error={errors.mac_address}
                placeholder="e.g. AA:BB:CC:DD:EE:FF"
              />
              <Input
                label="IP Address"
                name="ip_address"
                value={formData.ip_address}
                onChange={e => setFormData({ ...formData, ip_address: e.target.value })}
                error={errors.ip_address}
                placeholder="e.g. 192.168.1.10"
              />
              <button type="button" className="fetch-network-btn" onClick={fetchFromNetwork} disabled={fetchingNetwork}>
                <Wifi size={15} />
                {fetchingNetwork ? 'Fetching...' : 'Fetch from Network'}
              </button>
              <Select
                label="Linked Location *"
                name="location_id"
                value={formData.location_id}
                onChange={e => setFormData({ ...formData, location_id: e.target.value })}
                options={locationOptions}
                error={errors.location_id}
              />
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <span className="toggle-text">Active</span>
              </label>

              <div className="modal__footer">
                <Button variant="secondary" onClick={closeModal} type="button">Cancel</Button>
                <Button variant="primary" type="submit">
                  <Check size={16} />
                  {editingId ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
