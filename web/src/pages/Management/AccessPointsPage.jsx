import { useEffect, useState } from 'react'
import { useState as useStateHook } from 'react'
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet'
import L from 'leaflet'
import { Card, CardBody, CardHeader, Button, Input, Loading } from '../../components/Common'
import { useToast } from '../../hooks/useToast'
import { listLocations, createLocation, updateLocation, deleteLocation } from '../../api/services'
import './Management.css'

// Fix for default markers in leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

export default function AccessPointsPage() {
  const toast = useToast()
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [isEditingNew, setIsEditingNew] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    radius: '',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    _fetchLocations()
  }, [])

  const _fetchLocations = async () => {
    setLoading(true)
    try {
      const data = await listLocations({ limit: 100 })
      setLocations(data.data || data || [])
    } catch (error) {
      toast.error('Failed to load locations')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name) newErrors.name = 'Name is required'
    if (!formData.latitude) newErrors.latitude = 'Latitude is required'
    if (isNaN(parseFloat(formData.latitude))) newErrors.latitude = 'Invalid latitude'
    if (!formData.longitude) newErrors.longitude = 'Longitude is required'
    if (isNaN(parseFloat(formData.longitude))) newErrors.longitude = 'Invalid longitude'
    if (!formData.radius) newErrors.radius = 'Radius is required'
    if (isNaN(parseInt(formData.radius)) || parseInt(formData.radius) <= 0) {
      newErrors.radius = 'Radius must be a positive number'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      await createLocation({
        name: formData.name,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        radius: parseInt(formData.radius),
      })
      
      setFormData({ name: '', latitude: '', longitude: '', radius: '' })
      setErrors({})
      setIsEditingNew(false)
      toast.success('Location created successfully')
      await _fetchLocations()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create location')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (locationId) => {
    if (!window.confirm('Delete this location?')) return

    setLoading(true)
    try {
      await deleteLocation(locationId)
      toast.success('Location deleted successfully')
      await _fetchLocations()
    } catch (error) {
      toast.error('Failed to delete location')
    } finally {
      setLoading(false)
    }
  }

  if (loading && locations.length === 0) {
    return <Loading />
  }

  // Map center: default to India center, or first location if available
  const mapCenter = locations.length > 0
    ? [parseFloat(locations[0].latitude), parseFloat(locations[0].longitude)]
    : [20.5937, 78.9629]

  return (
    <div className="management">
      <div className="management__header">
        <div>
          <h1>Access Points (Locations)</h1>
          <p>Manage WiFi access points and geofenced attendance locations</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h3>Locations Map</h3>
        </CardHeader>
        <CardBody>
          {locations.length > 0 ? (
            <MapContainer
              center={mapCenter}
              zoom={5}
              style={{ height: '400px', width: '100%', borderRadius: '8px' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {locations.map((location) => (
                <Circle
                  key={location.id}
                  center={[parseFloat(location.latitude), parseFloat(location.longitude)]}
                  radius={parseInt(location.radius)}
                  color="blue"
                  fillColor="lightblue"
                  fillOpacity={0.3}
                >
                  <Popup>
                    <div>
                      <strong>{location.name}</strong>
                      <p>
                        Lat: {location.latitude}, Lon: {location.longitude}
                      </p>
                      <p>Radius: {location.radius}m</p>
                    </div>
                  </Popup>
                </Circle>
              ))}
            </MapContainer>
          ) : (
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p>No locations available. Create one below.</p>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3>Location List</h3>
        </CardHeader>
        <CardBody>
          <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Name</th>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Latitude</th>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Longitude</th>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Radius (m)</th>
                  <th style={{ textAlign: 'center', padding: '10px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((location) => (
                  <tr key={location.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '10px' }}>{location.name}</td>
                    <td style={{ padding: '10px' }}>{location.latitude}</td>
                    <td style={{ padding: '10px' }}>{location.longitude}</td>
                    <td style={{ padding: '10px' }}>{location.radius}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <Button
                        variant="outline"
                        onClick={() => handleDelete(location.id)}
                        style={{ color: 'red' }}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {isEditingNew ? (
            <form onSubmit={handleCreate} style={{ marginTop: '20px' }}>
              <h4>Add New Location</h4>
              <Input
                label="Location Name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={errors.name}
                disabled={loading}
              />
              <Input
                label="Latitude"
                type="number"
                step="0.0001"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                error={errors.latitude}
                disabled={loading}
              />
              <Input
                label="Longitude"
                type="number"
                step="0.0001"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                error={errors.longitude}
                disabled={loading}
              />
              <Input
                label="Geofence Radius (meters)"
                type="number"
                value={formData.radius}
                onChange={(e) => setFormData({ ...formData, radius: e.target.value })}
                error={errors.radius}
                disabled={loading}
              />
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => {
                    setIsEditingNew(false)
                    setFormData({ name: '', latitude: '', longitude: '', radius: '' })
                    setErrors({})
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Location'}
                </Button>
              </div>
            </form>
          ) : (
            <Button
              variant="primary"
              onClick={() => setIsEditingNew(true)}
              style={{ marginTop: '10px' }}
            >
              + Add Location
            </Button>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
