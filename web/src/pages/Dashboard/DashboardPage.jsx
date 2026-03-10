import { useEffect, useState } from 'react'
import { getDashboardStats } from '../../api/services'
import { Card, CardHeader, CardBody, Loading } from '../../components/Common'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import './Dashboard.css'

export default function DashboardPage() {
  const [summary, setSummary] = useState({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats()
        setSummary(data?.data || data || {})
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return <Loading />
  }
  
  const COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b']

  // Calculate attendance rate percentage
  const attendanceRate = summary.attendance_rate || 0
  
  // Status breakdown for pie chart
  const statusBreakdown = [
    { name: 'Present', value: summary.present || 0 },
    { name: 'Absent', value: summary.absent || 0 },
    { name: 'Late', value: summary.late || 0 },
  ].filter(item => item.value > 0)

  const attendanceData = Array.isArray(summary.trend)
    ? summary.trend.map((item) => ({
        date: item.date?.slice(5) || item.date,
        count: item.count,
      }))
    : []

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1>Dashboard</h1>
        <p>Welcome to your admin dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="dashboard__stat-grid">
        <div className="stat-card">
          <div className="stat-card__content">
            <div className="stat-card__value">{summary.total || 0}</div>
            <div className="stat-card__label">Total Records</div>
          </div>
          <div className="stat-card__icon stat-card__icon--primary">📋</div>
        </div>

        <div className="stat-card">
          <div className="stat-card__content">
            <div className="stat-card__value">{summary.present || 0}</div>
            <div className="stat-card__label">Present</div>
          </div>
          <div className="stat-card__icon stat-card__icon--success">✓</div>
        </div>

        <div className="stat-card">
          <div className="stat-card__content">
            <div className="stat-card__value">{attendanceRate.toFixed(1)}%</div>
            <div className="stat-card__label">Attendance Rate</div>
          </div>
          <div className="stat-card__icon stat-card__icon--secondary">📊</div>
        </div>

        <div className="stat-card">
          <div className="stat-card__content">
            <div className="stat-card__value">{summary.absent || 0}</div>
            <div className="stat-card__label">Absent</div>
          </div>
          <div className="stat-card__icon stat-card__icon--info">📍</div>
        </div>
      </div>

      {/* Charts */}
      <div className="dashboard__charts">{statusBreakdown.length > 0 && (
          <Card className="dashboard__chart-card">
            <CardHeader>
              <h3>Attendance Status Breakdown</h3>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{
                    background: 'var(--neo-light-surface)',
                    border: `1px solid var(--neo-light-border)`,
                    borderRadius: 'var(--radius-lg)'
                  }} />
                </PieChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        )}

        <Card className="dashboard__chart-card">
          <CardHeader>
            <h3>Attendance Trend (Last 7 Days)</h3>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--neo-light-border)" />
                <XAxis dataKey="date" stroke="var(--neo-light-text-tertiary)" />
                <YAxis stroke="var(--neo-light-text-tertiary)" />
                <Tooltip contentStyle={{ 
                  background: 'var(--neo-light-surface)',
                  border: `1px solid var(--neo-light-border)`,
                  borderRadius: 'var(--radius-lg)'
                }} />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="var(--neo-primary)" strokeWidth={2} dot={{ fill: 'var(--neo-primary)' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card className="dashboard__chart-card">
          <CardHeader>
            <h3>Overall Statistics</h3>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: 'Present', count: summary.present || 0 },
                { name: 'Absent', count: summary.absent || 0 },
                { name: 'Late', count: summary.late || 0 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--neo-light-border)" />
                <XAxis dataKey="name" stroke="var(--neo-light-text-tertiary)" />
                <YAxis stroke="var(--neo-light-text-tertiary)" />
                <Tooltip contentStyle={{
                  background: 'var(--neo-light-surface)',
                  border: `1px solid var(--neo-light-border)`,
                  borderRadius: 'var(--radius-lg)'
                }} />
                <Bar dataKey="count" fill="var(--neo-primary)" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
