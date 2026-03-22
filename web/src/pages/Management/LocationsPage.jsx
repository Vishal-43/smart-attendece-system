import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Circle, Popup, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { Card, CardHeader, CardBody, Button, Input, Loading, Select } from '../../components/Common'
import { useToast } from '../../hooks/useToast'
import { listLocations, createLocation, updateLocation, deleteLocation } from '../../api/services'
import { MapPin, Plus, Edit2, Trash2, Search, X, Check, Navigation } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import './LocationsPage.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

function LocationMarker({ position, onClick }) {
  const map = useMapEvents({
    click(e) {
      if (onClick) onClick(e.latlng)
    },
  })
  return position ? <Marker position={position} /> : null
}

const ROOM_TYPES = [
  { label: 'Classroom', value: 'classroom' },
  { label: 'Lab', value: 'lab' },
  { label: 'Auditorium', value: 'auditorium' },
  { label: 'Seminar Hall', value: 'seminar_hall' },
  { label: 'Workshop', value: 'workshop' },
  { label: 'Library', value: 'library' },
  { label: 'Other', value: 'other' },
]

const EMPTY_FORM = {
  name: '',
  latitude: '',
  longitude: '',
  radius: '100',
  room_no: '',
  floor: '',
  room_type: 'classroom',
  capacity: '',
  address: '',
}

export default function LocationsPage() {
  const toast = useToast()
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [pickedLocation, setPickedLocation] = useState(null)
  const [showMap, setShowMap] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)

  useEffect(() => { fetchLocations() }, [])

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }
    setGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setFormData(prev => ({ ...prev, latitude: latitude.toFixed(6), longitude: longitude.toFixed(6) }))
        setPickedLocation({ lat: latitude, lng: longitude })
        toast.success('Location set from GPS')
        setGettingLocation(false)
      },
      (error) => {
        toast.error('Unable to get location: ' + error.message)
        setGettingLocation(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const fetchLocations = async () => {
    setLoading(true)
    try {
      const data = await listLocations({ limit: 500 })
      setLocations(Array.isArray(data) ? data : data?.data || [])
    } catch {
      toast.error('Failed to load locations')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const errs = {}
    if (!formData.name.trim()) errs.name = 'Name is required'
    if (!formData.latitude && !pickedLocation) errs.latitude = 'Latitude is required'
    if (!formData.longitude && !pickedLocation) errs.longitude = 'Longitude is required'
    if (!formData.radius || parseInt(formData.radius) <= 0) errs.radius = 'Radius must be positive'
    if (!formData.room_type) errs.room_type = 'Room type is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    const payload = {
      name: formData.name.trim(),
      latitude: parseFloat(formData.latitude || pickedLocation?.lat),
      longitude: parseFloat(formData.longitude || pickedLocation?.lng),
      radius: parseInt(formData.radius),
      room_no: formData.room_no || undefined,
      floor: formData.floor || undefined,
      room_type: formData.room_type,
      capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
      address: formData.address || undefined,
    }
    try {
      if (editingId) {
        await updateLocation(editingId, payload)
        toast.success('Location updated successfully')
      } else {
        await createLocation(payload)
        toast.success('Location created successfully')
      }
      closeModal()
      fetchLocations()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this location? This cannot be undone.')) return
    try {
      await deleteLocation(id)
      toast.success('Location deleted')
      fetchLocations()
    } catch {
      toast.error('Failed to delete location')
    }
  }

  const openCreate = () => {
    setEditingId(null)
    setFormData(EMPTY_FORM)
    setErrors({})
    setPickedLocation(null)
    setIsModalOpen(true)
  }

  const openEdit = (loc) => {
    setEditingId(loc.id)
    setFormData({
      name: loc.name || '',
      latitude: loc.latitude || '',
      longitude: loc.longitude || '',
      radius: loc.radius || '100',
      room_no: loc.room_no || '',
      floor: loc.floor || '',
      room_type: loc.room_type || 'classroom',
      capacity: loc.capacity || '',
      address: loc.address || '',
    })
    setErrors({})
    setPickedLocation(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setFormData(EMPTY_FORM)
    setErrors({})
    setPickedLocation(null)
  }

  const handleMapClick = (latlng) => {
    setPickedLocation(latlng)
    setFormData(f => ({ ...f, latitude: latlng.lat.toFixed(6), longitude: latlng.lng.toFixed(6) }))
  }

  const filtered = locations.filter(l =>
    l.name?.toLowerCase().includes(search.toLowerCase()) ||
    l.room_no?.toLowerCase().includes(search.toLowerCase())
  )

  const mapCenter = pickedLocation
    ? [pickedLocation.lat, pickedLocation.lng]
    : filtered.length > 0
      ? [parseFloat(filtered[0].latitude), parseFloat(filtered[0].longitude)]
      : [20.5937, 78.9629]

  if (loading && locations.length === 0) return <Loading />

  return (
    <div className="page-inner">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <MapPin className="page-title-icon" />
            Locations
          </h1>
          <p className="page-subtitle">Manage geofenced attendance locations</p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          <Plus size={16} /> Add Location
        </Button>
      </div>

      <div className="locations-layout">
        <Card className="locations-map-card">
          <CardHeader>
            <h3 className="card-title">
              <MapPin size={18} />
              Location Map
            </h3>
            <span className="badge">{filtered.length} locations</span>
          </CardHeader>
          <CardBody>
            {filtered.length > 0 ? (
              <MapContainer
                center={mapCenter}
                zoom={13}
                className="location-map"
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {filtered.map(loc => (
                  <Circle
                    key={loc.id}
                    center={[parseFloat(loc.latitude), parseFloat(loc.longitude)]}
                    radius={parseInt(loc.radius)}
                    color="#4f46e5"
                    fillColor="#6366f1"
                    fillOpacity={0.25}
                    weight={2}
                  >
                    <Popup>
                      <div className="map-popup">
                        <strong>{loc.name}</strong>
                        <span>{loc.room_no ? `Room ${loc.room_no}` : ''}</span>
                        <span>{loc.room_type}</span>
                        <button onClick={() => openEdit(loc)} className="popup-edit-btn">
                          <Edit2 size={12} /> Edit
                        </button>
                      </div>
                    </Popup>
                  </Circle>
                ))}
              </MapContainer>
            ) : (
              <div className="empty-map">
                <MapPin size={48} />
                <p>No locations yet. Add one to see it on the map.</p>
              </div>
            )}
          </CardBody>
        </Card>

        <Card className="locations-table-card">
          <CardHeader>
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search locations..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="search-input"
              />
            </div>
          </CardHeader>
          <CardBody>
            {loading ? (
              <Loading />
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <MapPin size={40} />
                <p>No locations found</p>
              </div>
            ) : (
              <div className="locations-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Room</th>
                      <th>Type</th>
                      <th>Radius</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(loc => (
                      <tr key={loc.id}>
                        <td className="location-name">{loc.name}</td>
                        <td>{loc.room_no || '—'}</td>
                        <td><span className={`type-badge type-${(loc.room_type || '').toLowerCase()}`}>{(loc.room_type || 'N/A').replace(/_/g, ' ')}</span></td>
                        <td>{loc.radius}m</td>
                        <td><span className="status-dot active" />Active</td>
                        <td>
                          <div className="action-btns">
                            <button className="icon-btn icon-btn--edit" onClick={() => openEdit(loc)} title="Edit">
                              <Edit2 size={14} />
                            </button>
                            <button className="icon-btn icon-btn--delete" onClick={() => handleDelete(loc.id)} title="Delete">
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
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal--lg" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">{editingId ? 'Edit Location' : 'Add New Location'}</h2>
              <button className="modal__close" onClick={closeModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal__body location-form">
              <div className="form-grid">
                <Input label="Location Name *" name="name" value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  error={errors.name} placeholder="e.g. Room 301, CS Lab A" />
                <Select label="Room Type *" name="room_type" value={formData.room_type}
                  onChange={e => setFormData({ ...formData, room_type: e.target.value })}
                  options={ROOM_TYPES} error={errors.room_type} />
                <Input label="Room No." name="room_no" value={formData.room_no}
                  onChange={e => setFormData({ ...formData, room_no: e.target.value })}
                  placeholder="e.g. 301" />
                <Input label="Floor" name="floor" value={formData.floor}
                  onChange={e => setFormData({ ...formData, floor: e.target.value })}
                  placeholder="e.g. 3rd Floor" />
                <Input label="Capacity" name="capacity" type="number" value={formData.capacity}
                  onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                  placeholder="e.g. 60" />
                <Input label="Geofence Radius (meters) *" name="radius" type="number"
                  value={formData.radius}
                  onChange={e => setFormData({ ...formData, radius: e.target.value })}
                  error={errors.radius} />
              </div>

              <div className="form-section">
                <label className="form-label">Coordinates</label>
                <div className="coord-grid">
                  <Input label="Latitude *" name="latitude" type="number" step="0.000001"
                    value={formData.latitude}
                    onChange={e => setFormData({ ...formData, latitude: e.target.value })}
                    error={errors.latitude} placeholder="e.g. 12.9716" />
                  <Input label="Longitude *" name="longitude" type="number" step="0.000001"
                    value={formData.longitude}
                    onChange={e => setFormData({ ...formData, longitude: e.target.value })}
                    error={errors.longitude} placeholder="e.g. 77.5946" />
                </div>
                <div className="location-buttons">
                  <button type="button" className="pick-location-btn"
                    onClick={useCurrentLocation} disabled={gettingLocation}>
                    <Navigation size={15} />
                    {gettingLocation ? 'Getting Location...' : 'Use Current Location'}
                  </button>
                  <button type="button" className="pick-location-btn"
                    onClick={() => setShowMap(!showMap)}>
                    <MapPin size={15} />
                    {showMap ? 'Hide Map Picker' : 'Pick Location on Map'}
                  </button>
                </div>
                {showMap && (
                  <div className="location-picker-map">
                    <MapContainer
                      center={mapCenter}
                      zoom={13}
                      className="picker-map"
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <LocationMarker position={pickedLocation} onClick={handleMapClick} />
                      {pickedLocation && (
                        <Circle center={[pickedLocation.lat, pickedLocation.lng]}
                          radius={parseInt(formData.radius) || 100}
                          color="#4f46e5" fillColor="#6366f1" fillOpacity={0.3} />
                      )}
                    </MapContainer>
                    <p className="picker-hint">Click on the map to set location</p>
                  </div>
                )}
              </div>

              <Input label="Address" name="address" value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                placeholder="Full address (optional)" />

              <div className="modal__footer">
                <Button variant="secondary" onClick={closeModal} type="button">Cancel</Button>
                <Button variant="primary" type="submit">
                  <Check size={16} />
                  {editingId ? 'Update Location' : 'Create Location'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
