// DashboardPage.jsx - Enterprise Professional Dashboard
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Users, CheckCircle, XCircle, Clock, 
  Activity, Calendar, ArrowUpRight, ArrowDownRight,
  FileText, BookOpen, MapPin, TrendingUp, Zap
} from 'lucide-react'
import { getDashboardStats } from '../../api/services'
import { Loading } from '../../components/Common'
import AttendanceDonut from './charts/AttendanceDonut'
import TrendLine from './charts/TrendLine'
import StatsBar from './charts/StatsBar'
import './DashboardPage.css'

const StatCard = ({ icon: Icon, label, value, subValue, trend, trendLabel, color }) => (
  <div className="card">
    <div className="card__body stat-card-body">
      <div className="stat-icon-wrapper" style={{ backgroundColor: color.bg, color: color.text }}>
        <Icon size={18} strokeWidth={1.75} />
      </div>
      <div className="text-label">{label}</div>
      <div className="display-number stat-value">{value}</div>
      {(trend || subValue) && (
        <div className={`stat-trend stat-trend--${trend}`}>
          {trend === 'up' && <span className="stat-trend-arrow">▲</span>}
          {trend === 'down' && <span className="stat-trend-arrow">▼</span>}
          {trend === 'neutral' && <span className="stat-trend-arrow">▶</span>}
          <span>{subValue || trendLabel}</span>
        </div>
      )}
    </div>
  </div>
)

export default function DashboardPage() {
  const navigate = useNavigate()
  const [summary, setSummary] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats()
        setSummary(data || {})
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  if (isLoading) return <Loading />

  const presentRate = summary.present
    ? ((summary.present / summary.total) * 100).toFixed(1)
    : '0'
  const absentRate = summary.absent
    ? ((summary.absent / summary.total) * 100).toFixed(1)
    : '0'
  const lateRate = summary.late
    ? ((summary.late / summary.total) * 100).toFixed(1)
    : '0'

  const donutData = [
    { name: 'Present', value: +presentRate, color: 'var(--ink-primary)' },
    { name: 'Absent', value: +absentRate, color: 'var(--danger)' },
    { name: 'Late', value: +lateRate, color: 'var(--warning)' },
  ].filter(d => d.value > 0)

  const trendData = Array.isArray(summary.trend)
    ? summary.trend.map(item => ({
        date: item.date?.slice(5) || item.date,
        count: item.count,
      }))
    : []

  const barData = [
    { name: 'Present', value: summary.present || 0 },
    { name: 'Absent', value: summary.absent || 0 },
    { name: 'Late', value: summary.late || 0 },
  ]

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const quickActions = [
    { label: 'View Users', icon: Users, path: '/management/users', color: '#3B82F6' },
    { label: 'Attendance', icon: FileText, path: '/reports/attendance', color: '#10B981' },
    { label: 'Courses', icon: BookOpen, path: '/management/courses', color: '#8B5CF6' },
    { label: 'Locations', icon: MapPin, path: '/management/locations', color: '#F59E0B' },
  ]

  const handleQuickAction = (path) => {
    navigate(path)
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard__header">
        <div className="dashboard__greeting">
          <div className="dashboard__title-wrap">
            <h1 className="page-title">
              <Activity size={28} className="dashboard__title-icon" />
              Dashboard
            </h1>
            <p className="page-subtitle">Welcome back! Here's today's attendance overview</p>
          </div>
          <div className="dashboard__meta">
            <div className="dashboard__status">
              <span className="dashboard__status-dot" />
              <span>Live</span>
            </div>
            <div className="dashboard__date">
              <Calendar size={14} />
              <span>{formatDate(currentTime)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          icon={Users}
          label="TODAY'S TOTAL"
          value={summary.total || 0}
          trendLabel={summary.attendance_rate ? `${summary.attendance_rate}% attendance` : 'No data'}
          trend={summary.attendance_rate >= 75 ? 'up' : summary.attendance_rate >= 50 ? 'neutral' : 'down'}
          color={{ bg: 'var(--bg-surface)', text: 'var(--ink-primary)' }}
        />
        <StatCard
          icon={CheckCircle}
          label="PRESENT TODAY"
          value={summary.present || 0}
          trendLabel={`${presentRate}%`}
          trend="up"
          color={{ bg: 'var(--success-bg)', text: 'var(--success-text)' }}
        />
        <StatCard
          icon={XCircle}
          label="ABSENT TODAY"
          value={summary.absent || 0}
          trendLabel={`${absentRate}%`}
          trend={summary.absent > 0 ? 'down' : 'neutral'}
          color={{ bg: 'var(--danger-bg)', text: 'var(--danger-text)' }}
        />
        <StatCard
          icon={Clock}
          label="LATE TODAY"
          value={summary.late || 0}
          trendLabel={`${lateRate}%`}
          trend="neutral"
          color={{ bg: 'var(--warning-bg)', text: 'var(--warning-text)' }}
        />
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="charts-grid">
          {/* Attendance Donut */}
          <div className="chart-card">
            <div className="chart-card__header">
              <div className="chart-card__title-wrap">
                <h3 className="chart-card__title">Attendance Breakdown</h3>
                <p className="chart-card__subtitle">Distribution of today's status</p>
              </div>
              <span className="chart-card__badge">Today</span>
            </div>
            <div className="chart-card__body">
              <AttendanceDonut data={donutData} />
            </div>
          </div>

          {/* Trend Line */}
          <div className="chart-card chart-card--wide">
            <div className="chart-card__header">
              <div className="chart-card__title-wrap">
                <h3 className="chart-card__title">7-Day Attendance Trend</h3>
                <p className="chart-card__subtitle">Daily attendance count over the week</p>
              </div>
              <span className="chart-card__badge">Last 7 days</span>
            </div>
            <div className="chart-card__body">
              <TrendLine data={trendData} />
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="chart-card">
          <div className="chart-card__header">
            <div className="chart-card__title-wrap">
              <h3 className="chart-card__title">
                <TrendingUp size={20} className="chart-card__title-icon" />
                Today's Statistics
              </h3>
              <p className="chart-card__subtitle">Summary of today's present, absent, and late records</p>
            </div>
          </div>
          <div className="chart-card__body chart-card__body--stats">
            <StatsBar data={barData} />
            <div className="stats-legend">
              {barData.map((item, idx) => (
                <div key={idx} className="stats-legend__item">
                  <div 
                    className="stats-legend__dot" 
                    style={{ 
                      background: idx === 0 ? '#10B981' : idx === 1 ? '#EF4444' : '#F59E0B' 
                    }} 
                  />
                  <span className="stats-legend__label">{item.name}</span>
                  <span className="stats-legend__value">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3 className="quick-actions__title">Quick Actions</h3>
        <div className="quick-actions__grid">
          {quickActions.map((action, idx) => (
            <div 
              key={idx} 
              className="quick-action"
              style={{ '--accent': action.color }}
              onClick={() => handleQuickAction(action.path)}
            >
              <div className="quick-action__icon">
                <action.icon size={20} />
              </div>
              <span className="quick-action__label">{action.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}