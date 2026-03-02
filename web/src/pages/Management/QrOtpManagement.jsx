// web/src/pages/Management/QrOtpManagement.jsx
// QR Code and OTP generation interface for teachers and admins

import { useState, useEffect } from 'react';
import { qrAPI, otpAPI, timetablesAPI } from '../../api/endpoints';
import useToast from '../../hooks/useToast';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import Loading from '../../components/Common/Loading';
import { Select } from '../../components/Common/Input';

export default function QrOtpManagement() {
  const [activeTab, setActiveTab] = useState('qr');
  const [timetables, setTimetables] = useState([]);
  const [selectedTimetable, setSelectedTimetable] = useState('');
  const [qrData, setQrData] = useState(null);
  const [otpData, setOtpData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingTimetables, setFetchingTimetables] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const toast = useToast();

  // Fetch available timetables
  useEffect(() => {
    fetchTimetables();
  }, []);

  // Auto-refresh countdown
  useEffect(() => {
    const timer = setInterval(() => {
      if (activeTab === 'qr' && qrData?.expires_at) {
        const remaining = calculateTimeRemaining(qrData.expires_at);
        setTimeRemaining(remaining);
        
        if (remaining <= 0) {
          toast.warning('QR Code has expired');
          setQrData(null);
        }
      } else if (activeTab === 'otp' && otpData?.expires_at) {
        const remaining = calculateTimeRemaining(otpData.expires_at);
        setTimeRemaining(remaining);
        
        if (remaining <= 0) {
          toast.warning('OTP has expired');
          setOtpData(null);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTab, qrData, otpData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!selectedTimetable) return;

    const interval = setInterval(() => {
      if (activeTab === 'qr' && qrData) {
        fetchCurrentQR();
      } else if (activeTab === 'otp' && otpData) {
        fetchCurrentOTP();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedTimetable, activeTab, qrData, otpData]);

  const fetchTimetables = async () => {
    try {
      const response = await timetablesAPI.listTimetables();
      const data = response.data.data || response.data;
      setTimetables(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to fetch timetables');
      console.error(error);
    } finally {
      setFetchingTimetables(false);
    }
  };

  const calculateTimeRemaining = (expiresAt) => {
    const expiry = new Date(expiresAt);
    const now = new Date();
    return Math.max(0, Math.floor((expiry - now) / 1000));
  };

  const formatTime = (seconds) => {
    if (seconds === null) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const fetchCurrentQR = async () => {
    if (!selectedTimetable) return;
    
    try {
      const response = await qrAPI.getCurrent(selectedTimetable, { with_image: true });
      const data = response.data.data || response.data;
      setQrData(data);
      setTimeRemaining(calculateTimeRemaining(data.expires_at));
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error('Failed to fetch current QR code');
      }
      setQrData(null);
    }
  };

  const fetchCurrentOTP = async () => {
    if (!selectedTimetable) return;
    
    try {
      const response = await otpAPI.getCurrent(selectedTimetable);
      const data = response.data.data || response.data;
      setOtpData(data);
      setTimeRemaining(calculateTimeRemaining(data.expires_at));
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error('Failed to fetch current OTP');
      }
      setOtpData(null);
    }
  };

  const generateQR = async () => {
    if (!selectedTimetable) {
      toast.error('Please select a timetable first');
      return;
    }

    setLoading(true);
    try {
      const response = await qrAPI.generate(selectedTimetable, { ttl_minutes: 10 });
      const data = response.data.data || response.data;
      setQrData(data);
      setTimeRemaining(calculateTimeRemaining(data.expires_at));
      toast.success('QR Code generated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const generateOTP = async () => {
    if (!selectedTimetable) {
      toast.error('Please select a timetable first');
      return;
    }

    setLoading(true);
    try {
      const response = await otpAPI.generate(selectedTimetable, { ttl_minutes: 5 });
      const data = response.data.data || response.data;
      setOtpData(data);
      setTimeRemaining(calculateTimeRemaining(data.expires_at));
      toast.success('OTP generated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate OTP');
    } finally {
      setLoading(false);
    }
  };

  const refreshQR = async () => {
    if (!selectedTimetable) return;

    setLoading(true);
    try {
      const response = await qrAPI.refresh(selectedTimetable);
      const data = response.data.data || response.data;
      setQrData(data);
      setTimeRemaining(calculateTimeRemaining(data.expires_at));
      toast.success('QR Code refreshed');
    } catch (error) {
      toast.error('Failed to refresh QR code');
    } finally {
      setLoading(false);
    }
  };

  const refreshOTP = async () => {
    if (!selectedTimetable) return;

    setLoading(true);
    try {
      const response = await otpAPI.refresh(selectedTimetable);
      const data = response.data.data || response.data;
      setOtpData(data);
      setTimeRemaining(calculateTimeRemaining(data.expires_at));
      toast.success('OTP refreshed');
    } catch (error) {
      toast.error('Failed to refresh OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleTimetableChange = (e) => {
    const value = e.target.value;
    setSelectedTimetable(value);
    setQrData(null);
    setOtpData(null);
    setTimeRemaining(null);
    
    if (value) {
      if (activeTab === 'qr') {
        fetchCurrentQR();
      } else {
        fetchCurrentOTP();
      }
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setTimeRemaining(null);
    
    if (selectedTimetable) {
      if (tab === 'qr') {
        fetchCurrentQR();
      } else {
        fetchCurrentOTP();
      }
    }
  };

  if (fetchingTimetables) {
    return <Loading />;
  }

  return (
    <div className="qr-otp-management">
      <div className="page-header">
        <h1>QR Code & OTP Management</h1>
        <p>Generate and manage attendance verification codes</p>
      </div>

      <Card>
        <div className="form-group">
          <label htmlFor="timetable-select">Select Timetable</label>
          <Select
            id="timetable-select"
            value={selectedTimetable}
            onChange={handleTimetableChange}
          >
            <option value="">-- Select a timetable --</option>
            {timetables.map((tt) => (
              <option key={tt.id} value={tt.id}>
                {tt.subject} - {tt.day_of_week} {tt.start_time}
              </option>
            ))}
          </Select>
        </div>

        {selectedTimetable && (
          <>
            <div className="tabs">
              <button
                className={`tab ${activeTab === 'qr' ? 'active' : ''}`}
                onClick={() => handleTabChange('qr')}
              >
                QR Code
              </button>
              <button
                className={`tab ${activeTab === 'otp' ? 'active' : ''}`}
                onClick={() => handleTabChange('otp')}
              >
                OTP
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'qr' ? (
                <div className="qr-section">
                  {qrData ? (
                    <div className="code-display">
                      <div className="qr-image-container">
                        <img
                          src={`data:image/png;base64,${qrData.qr_image_base64}`}
                          alt="QR Code"
                          className="qr-code-image"
                        />
                      </div>
                      <div className="code-info">
                        <p className="expiry-label">Expires in:</p>
                        <p className={`countdown ${timeRemaining < 60 ? 'urgent' : ''}`}>
                          {formatTime(timeRemaining)}
                        </p>
                        <p className="code-value">Code: {qrData.code}</p>
                      </div>
                      <Button
                        variant="primary"
                        onClick={refreshQR}
                        disabled={loading}
                      >
                        Refresh QR Code
                      </Button>
                    </div>
                  ) : (
                    <div className="no-code">
                      <p>No active QR code for this timetable</p>
                      <Button
                        variant="primary"
                        onClick={generateQR}
                        disabled={loading}
                      >
                        Generate QR Code
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="otp-section">
                  {otpData ? (
                    <div className="code-display">
                      <div className="otp-display">
                        <p className="otp-code">{otpData.code}</p>
                      </div>
                      <div className="code-info">
                        <p className="expiry-label">Expires in:</p>
                        <p className={`countdown ${timeRemaining < 60 ? 'urgent' : ''}`}>
                          {formatTime(timeRemaining)}
                        </p>
                      </div>
                      <Button
                        variant="primary"
                        onClick={refreshOTP}
                        disabled={loading}
                      >
                        Refresh OTP
                      </Button>
                    </div>
                  ) : (
                    <div className="no-code">
                      <p>No active OTP for this timetable</p>
                      <Button
                        variant="primary"
                        onClick={generateOTP}
                        disabled={loading}
                      >
                        Generate OTP
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </Card>

      <style jsx>{`
        .qr-otp-management {
          padding: 2rem;
        }

        .page-header {
          margin-bottom: 2rem;
        }

        .page-header h1 {
          margin: 0;
          color: var(--color-text-primary);
        }

        .page-header p {
          margin: 0.5rem 0 0;
          color: var(--color-text-secondary);
        }

        .form-group {
          margin-bottom: 2rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: var(--color-text-primary);
        }

        .tabs {
          display: flex;
          gap: 0.5rem;
          border-bottom: 2px solid var(--color-border);
          margin-bottom: 2rem;
        }

        .tab {
          padding: 0.75rem 1.5rem;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 500;
          color: var(--color-text-secondary);
          border-bottom: 2px solid transparent;
          margin-bottom: -2px;
          transition: all 0.2s;
        }

        .tab:hover {
          color: var(--color-primary);
        }

        .tab.active {
          color: var(--color-primary);
          border-bottom-color: var(--color-primary);
        }

        .code-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          padding: 2rem;
        }

        .qr-image-container {
          padding: 1rem;
          background: white;
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
        }

        .qr-code-image {
          display: block;
          width: 300px;
          height: 300px;
        }

        .otp-display {
          background: var(--color-primary-subtle);
          border: 2px solid var(--color-primary);
          border-radius: var(--radius-lg);
          padding: 3rem;
        }

        .otp-code {
          font-size: 4rem;
          font-weight: bold;
          font-family: 'Courier New', monospace;
          letter-spacing: 0.5rem;
          color: var(--color-primary);
          margin: 0;
          text-align: center;
        }

        .code-info {
          text-align: center;
        }

        .expiry-label {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          margin: 0;
        }

        .countdown {
          font-size: 2rem;
          font-weight: bold;
          font-family: 'Courier New', monospace;
          color: var(--color-text-primary);
          margin: 0.5rem 0;
        }

        .countdown.urgent {
          color: var(--color-error);
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .code-value {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          margin: 0.5rem 0 0;
        }

        .no-code {
          text-align: center;
          padding: 3rem;
        }

        .no-code p {
          margin: 0 0 1.5rem;
          color: var(--color-text-secondary);
        }
      `}</style>
    </div>
  );
}
