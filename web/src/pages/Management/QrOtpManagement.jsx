// QrOtpManagement.jsx - Modern QR Code and OTP Management
import { useState, useEffect } from 'react'
import { QrCode, KeyRound, RefreshCw, XCircle, Clock, CheckCircle, Users } from 'lucide-react'
import { qrAPI, otpAPI, timetablesAPI } from '../../api/endpoints'
import { Card, Loading } from '../../components/Common'
import API_CONFIG from '../../config/api.js'
import './QrOtpManagement.css'

export default function QrOtpManagement() {
  const [activeTab, setActiveTab] = useState('qr')
  const [timetables, setTimetables] = useState([])
  const [selectedTimetable, setSelectedTimetable] = useState('')
  const [qrData, setQrData] = useState(null)
  const [otpData, setOtpData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetchingTimetables, setFetchingTimetables] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState(null)
  const [liveCount, setLiveCount] = useState(0)

  useEffect(() => {
    fetchTimetables()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      const data = activeTab === 'qr' ? qrData : otpData
      if (data?.expires_at) {
        const remaining = calculateTimeRemaining(data.expires_at)
        setTimeRemaining(remaining)
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [activeTab, qrData, otpData])

  useEffect(() => {
    if (!selectedTimetable) return
    const interval = setInterval(() => {
      if (activeTab === 'qr' && qrData) fetchCurrentQR()
      else if (activeTab === 'otp' && otpData) fetchCurrentOTP()
    }, 30000)
    return () => clearInterval(interval)
  }, [selectedTimetable, activeTab, qrData, otpData])

  useEffect(() => {
    if (!selectedTimetable) return
    const wsUrl = `${API_CONFIG.WS_BASE_URL}/ws/attendance/${selectedTimetable}`
    const ws = new WebSocket(wsUrl)
    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data)
        if (payload?.event === 'attendance_marked') {
          setLiveCount(prev => prev + 1)
        }
      } catch {}
    }
    return () => ws.close()
  }, [selectedTimetable])

  const fetchTimetables = async () => {
    try {
      const response = await timetablesAPI.getMySchedule()
      const data = response?.data?.data || response?.data || []
      setTimetables(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch timetables:', error)
    } finally {
      setFetchingTimetables(false)
    }
  }

  const calculateTimeRemaining = (expiresAt) => {
    const expiry = new Date(expiresAt)
    const now = new Date()
    return Math.max(0, Math.floor((expiry - now) / 1000))
  }

  const formatTime = (seconds) => {
    if (seconds === null) return '--:--'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const fetchCurrentQR = async () => {
    if (!selectedTimetable) return
    try {
      const response = await qrAPI.getCurrent(selectedTimetable, { with_image: true })
      const data = response?.data?.data || response?.data || response
      setQrData(data)
      setTimeRemaining(calculateTimeRemaining(data?.expires_at))
    } catch {
      setQrData(null)
    }
  }

  const fetchCurrentOTP = async () => {
    if (!selectedTimetable) return
    try {
      const response = await otpAPI.getCurrent(selectedTimetable)
      const data = response?.data?.data || response?.data || response
      setOtpData(data)
      setTimeRemaining(calculateTimeRemaining(data?.expires_at))
    } catch {
      setOtpData(null)
    }
  }

  const generateQR = async () => {
    if (!selectedTimetable) return
    setLoading(true)
    try {
      const response = await qrAPI.generate(selectedTimetable, { ttl_minutes: 10 })
      const data = response?.data?.data || response?.data || response
      setQrData(data)
      setTimeRemaining(calculateTimeRemaining(data?.expires_at))
    } catch (error) {
      console.error('Failed to generate QR:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateOTP = async () => {
    if (!selectedTimetable) return
    setLoading(true)
    try {
      const response = await otpAPI.generate(selectedTimetable, { ttl_minutes: 5 })
      const data = response?.data?.data || response?.data || response
      setOtpData(data)
      setTimeRemaining(calculateTimeRemaining(data?.expires_at))
    } catch (error) {
      console.error('Failed to generate OTP:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshQR = async () => {
    if (!selectedTimetable) return
    setLoading(true)
    try {
      const response = await qrAPI.refresh(selectedTimetable)
      const data = response?.data?.data || response?.data || response
      setQrData(data)
      setTimeRemaining(calculateTimeRemaining(data?.expires_at))
    } catch (error) {
      console.error('Failed to refresh QR:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshOTP = async () => {
    if (!selectedTimetable) return
    setLoading(true)
    try {
      const response = await otpAPI.refresh(selectedTimetable)
      const data = response?.data?.data || response?.data || response
      setOtpData(data)
      setTimeRemaining(calculateTimeRemaining(data?.expires_at))
    } catch (error) {
      console.error('Failed to refresh OTP:', error)
    } finally {
      setLoading(false)
    }
  }

  const endSession = async () => {
    if (!selectedTimetable) return
    if (!confirm('End this session? Students will no longer be able to mark attendance.')) return
    setLoading(true)
    try {
      const api = activeTab === 'qr' ? qrAPI : otpAPI
      await api.cancel(selectedTimetable)
      if (activeTab === 'qr') {
        setQrData(null)
      } else {
        setOtpData(null)
      }
      setTimeRemaining(null)
    } catch (error) {
      console.error('Failed to end session:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTimetableChange = (e) => {
    const value = e.target.value
    setSelectedTimetable(value)
    setQrData(null)
    setOtpData(null)
    setTimeRemaining(null)
    if (value) {
      if (activeTab === 'qr') fetchCurrentQR()
      else fetchCurrentOTP()
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setTimeRemaining(null)
    if (selectedTimetable) {
      if (tab === 'qr') fetchCurrentQR()
      else fetchCurrentOTP()
    }
  }

  if (fetchingTimetables) return <Loading />

  const currentData = activeTab === 'qr' ? qrData : otpData

  return (
    <div className="page-inner">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <QrCode size={24} />
            QR & OTP Management
          </h1>
          <p className="page-subtitle">Generate and manage attendance verification codes</p>
        </div>
        {selectedTimetable && (
          <div className="live-counter">
            <Users size={16} />
            <span>{liveCount} scans</span>
          </div>
        )}
      </div>

      <Card>
        <div className="qr-otp-content">
          <div className="form-group">
            <label className="form-label">Select Timetable</label>
            <select
              className="form-input form-select"
              value={selectedTimetable}
              onChange={handleTimetableChange}
            >
              <option value="">-- Select a timetable --</option>
              {timetables.map((tt) => (
                <option key={tt.id} value={tt.id}>
                  {tt.subject} - {tt.day_of_week} {tt.start_time}
                </option>
              ))}
            </select>
          </div>

          {selectedTimetable && (
            <>
              <div className="tabs">
                <button
                  className={`tab ${activeTab === 'qr' ? 'active' : ''}`}
                  onClick={() => handleTabChange('qr')}
                >
                  <QrCode size={16} />
                  QR Code
                </button>
                <button
                  className={`tab ${activeTab === 'otp' ? 'active' : ''}`}
                  onClick={() => handleTabChange('otp')}
                >
                  <KeyRound size={16} />
                  OTP
                </button>
              </div>

              <div className="tab-content">
                {activeTab === 'qr' ? (
                  <div className="code-section">
                    {qrData ? (
                      <div className="code-display">
                        <div className="qr-wrapper">
                          <img
                            src={`data:image/png;base64,${qrData.qr_image_base64}`}
                            alt="QR Code"
                            className="qr-code"
                          />
                        </div>
                        <div className="code-details">
                          <div className="expiry-section">
                            <Clock size={18} />
                            <span className="expiry-label">Expires in</span>
                            <span className={`countdown ${timeRemaining < 60 ? 'urgent' : ''}`}>
                              {formatTime(timeRemaining)}
                            </span>
                          </div>
                          {qrData.code && (
                            <div className="code-value">
                              <span>Code:</span>
                              <strong>{qrData.code}</strong>
                            </div>
                          )}
                        </div>
                        <div className="action-buttons">
                          <button className="btn btn--secondary" onClick={refreshQR} disabled={loading}>
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                            Refresh
                          </button>
                          <button className="btn btn--danger" onClick={endSession} disabled={loading}>
                            <XCircle size={14} />
                            End Session
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="no-code">
                        <div className="no-code-icon">
                          <QrCode size={48} />
                        </div>
                        <p>No active QR code for this timetable</p>
                        <button className="btn btn--primary" onClick={generateQR} disabled={loading}>
                          <QrCode size={16} />
                          Generate QR Code
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="code-section">
                    {otpData ? (
                      <div className="code-display">
                        <div className="otp-wrapper">
                          <span className="otp-code">{otpData.code}</span>
                        </div>
                        <div className="code-details">
                          <div className="expiry-section">
                            <Clock size={18} />
                            <span className="expiry-label">Expires in</span>
                            <span className={`countdown ${timeRemaining < 60 ? 'urgent' : ''}`}>
                              {formatTime(timeRemaining)}
                            </span>
                          </div>
                        </div>
                        <div className="action-buttons">
                          <button className="btn btn--secondary" onClick={refreshOTP} disabled={loading}>
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                            Refresh
                          </button>
                          <button className="btn btn--danger" onClick={endSession} disabled={loading}>
                            <XCircle size={14} />
                            End Session
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="no-code">
                        <div className="no-code-icon">
                          <KeyRound size={48} />
                        </div>
                        <p>No active OTP for this timetable</p>
                        <button className="btn btn--primary" onClick={generateOTP} disabled={loading}>
                          <KeyRound size={16} />
                          Generate OTP
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
