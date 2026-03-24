// DashboardPage.jsx - Modern Professional Dashboard with Charts
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Users, CheckCircle, XCircle, Clock,
  Activity, Calendar, FileText, BookOpen, MapPin,
  ArrowRight, TrendingUp, TrendingDown, RefreshCw,
  QrCode, GraduationCap, BarChart2
} from 'lucide-react'
import { getDashboardStats } from '../../api/services'
import { Loading } from '../../components/Common'
import TrendLine from './charts/TrendLine'
import AttendanceDonut from './charts/AttendanceDonut'
import './DashboardPage.css'

const StatCard = ({ icon: Icon, label, value, trend, trendLabel, iconClass, delay = 0 }) => {
  return (
    <div className="stat-card" style={{ animationDelay: `${delay}s` }}>
      <div className="stat-card__header">
        <div className={`stat-card__icon ${iconClass}`}>
          <Icon size={20} />
        </div>
        {trend && (
          <span className={`stat-card__trend stat-card__trend--${trend}`}>
            {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trendLabel}
          </span>
        )}
      </div>
      <div className="stat-card__value">{value}</div>
      <div className="stat-card__label">{label}</div>
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [summary, setSummary] = useState({})
  const [trendData, setTrendData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchStats = async () => {
    try {
      const data = await getDashboardStats()
      setSummary(data || {})
      if (data?.trend) {
        setTrendData(data.trend.map(item => ({
          date: item.date?.slice(5) || item.date,
          count: item.count,
        })))
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchStats()
  }

  if (isLoading) return <Loading />

  const presentRate = summary.present
    ? ((summary.present / summary.total) * 100).toFixed(0)
    : '0'

  const absentRate = summary.absent
    ? ((summary.absent / summary.total) * 100).toFixed(0)
    : '0'

  const donutData = [
    { name: 'Present', value: +presentRate, color: '#10b981' },
    { name: 'Absent', value: +absentRate, color: '#ef4444' },
    { name: 'Late', value: summary.late ? ((summary.late / summary.total) * 100).toFixed(0) : 0, color: '#f59e0b' },
  ].filter(d => d.value > 0)

  const quickActions = [
    { label: 'Users', icon: Users, path: '/management/users', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' },
    { label: 'QR/OTP', icon: QrCode, path: '/management/qr-otp', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
    { label: 'Courses', icon: BookOpen, path: '/management/courses', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
    { label: 'Timetables', icon: Calendar, path: '/management/timetables', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    { label: 'Reports', icon: FileText, path: '/reports/attendance', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' },
    { label: 'Analytics', icon: BarChart2, path: '/reports/analytics', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)' },
  ]

  const recentActivity = [
    { icon: CheckCircle, type: 'success', title: 'Attendance marked', meta: 'John Doe - CS101', time: '2 min ago' },
    { icon: XCircle, type: 'danger', title: 'Student absent', meta: 'Jane Smith - CS101', time: '5 min ago' },
    { icon: CheckCircle, type: 'success', title: 'Attendance marked', meta: 'Mike Johnson - CS201', time: '12 min ago' },
    { icon: Clock, type: 'warning', title: 'Late arrival recorded', meta: 'Sarah Wilson - CS101', time: '15 min ago' },
  ]

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard__header">
        <div className="dashboard__welcome">
          <div>
            <h1 className="dashboard__title">Dashboard</h1>
            <p className="dashboard__subtitle">Welcome back! Here's your attendance overview.</p>
          </div>
          <div className="dashboard__actions">
            <button className="btn btn--secondary" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
            <div className="dashboard__date">
              <Calendar size={14} />
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          icon={Users}
          label="Total Students"
          value={summary.total || 0}
          trend="up"
          trendLabel={`${summary.attendance_rate || 0}%`}
          iconClass="stat-card__icon--primary"
          delay={0}
        />
        <StatCard
          icon={CheckCircle}
          label="Present Today"
          value={summary.present || 0}
          trend="up"
          trendLabel={`${presentRate}%`}
          iconClass="stat-card__icon--success"
          delay={1}
        />
        <StatCard
          icon={XCircle}
          label="Absent Today"
          value={summary.absent || 0}
          trend={summary.absent > 0 ? 'down' : 'up'}
          trendLabel={summary.absent > 0 ? 'Needs review' : 'Great!'}
          iconClass="stat-card__icon--danger"
          delay={2}
        />
        <StatCard
          icon={Clock}
          label="Late Arrivals"
          value={summary.late || 0}
          iconClass="stat-card__icon--warning"
          delay={3}
        />
      </div>

      {/* Charts Section */}
      <div className="dashboard__charts">
        <div className="chart-card">
          <div className="chart-card__header">
            <h3 className="chart-card__title">
              <TrendingUp size={18} />
              Attendance Trend
            </h3>
            <span className="chart-card__badge">Last 7 Days</span>
          </div>
          <div className="chart-card__body">
            <TrendLine data={trendData} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card__header">
            <h3 className="chart-card__title">
              <Activity size={18} />
              Today's Breakdown
            </h3>
          </div>
          <div className="chart-card__body">
            <AttendanceDonut data={donutData} />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard__section">
        <div className="dashboard__section-header">
          <h2 className="dashboard__section-title">
            <Activity size={18} />
            Quick Actions
          </h2>
        </div>
        <div className="dashboard__section-body">
          <div className="quick-actions-grid">
            {quickActions.map((action, idx) => (
              <button 
                key={idx} 
                className="quick-action-card"
                style={{ '--action-bg': action.bg, '--action-color': action.color }}
                onClick={() => navigate(action.path)}
              >
                <div className="quick-action-card__icon">
                  <action.icon size={20} />
                </div>
                <span className="quick-action-card__label">{action.label}</span>
                <ArrowRight size={14} className="quick-action-card__arrow" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="dashboard__section">
        <div className="dashboard__section-header">
          <h2 className="dashboard__section-title">
            <Clock size={18} />
            Recent Activity
          </h2>
          <span className="dashboard__section-badge">Today</span>
        </div>
        <div className="dashboard__section-body">
          <div className="activity-list">
            {recentActivity.map((item, idx) => (
              <div key={idx} className="activity-item">
                <div className={`activity-item__icon activity-item__icon--${item.type}`}>
                  <item.icon size={16} />
                </div>
                <div className="activity-item__content">
                  <div className="activity-item__title">{item.title}</div>
                  <div className="activity-item__meta">{item.meta}</div>
                </div>
                <span className="activity-item__time">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
