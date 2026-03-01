import { useQuery } from '@tanstack/react-query'
import { Card, CardHeader, CardBody, Loading } from '../../components/Common'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import apiClient from '../../api/client'
import './Dashboard.css'

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => apiClient.get('/attendance/analytics'),
  })

  if (isLoading) {
    return <Loading />
  }

  const COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b']

  const attendanceData = stats?.data?.daily_attendance || []
  const divisionStats = stats?.data?.division_stats || []
  const statusBreakdown = stats?.data?.status_breakdown || []

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
            <div className="stat-card__value">{stats?.data?.total_students || 0}</div>
            <div className="stat-card__label">Total Students</div>
          </div>
          <div className="stat-card__icon stat-card__icon--primary">👥</div>
        </div>

        <div className="stat-card">
          <div className="stat-card__content">
            <div className="stat-card__value">{stats?.data?.total_courses || 0}</div>
            <div className="stat-card__label">Total Courses</div>
          </div>
          <div className="stat-card__icon stat-card__icon--secondary">📚</div>
        </div>

        <div className="stat-card">
          <div className="stat-card__content">
            <div className="stat-card__value">{stats?.data?.today_attendance || 0}%</div>
            <div className="stat-card__label">Today's Attendance</div>
          </div>
          <div className="stat-card__icon stat-card__icon--success">✓</div>
        </div>

        <div className="stat-card">
          <div className="stat-card__content">
            <div className="stat-card__value">{stats?.data?.total_locations || 0}</div>
            <div className="stat-card__label">Locations</div>
          </div>
          <div className="stat-card__icon stat-card__icon--info">📍</div>
        </div>
      </div>

      {/* Charts */}
      <div className="dashboard__charts">
        <Card className="dashboard__chart-card">
          <CardHeader>
            <h3>Attendance Trend (Last 7 Days)</h3>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--neo-light-border)" />
                <XAxis stroke="var(--neo-light-text-tertiary)" />
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

        <Card className="dashboard__chart-card">
          <CardHeader>
            <h3>Division-wise Attendance</h3>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={divisionStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--neo-light-border)" />
                <XAxis stroke="var(--neo-light-text-tertiary)" />
                <YAxis stroke="var(--neo-light-text-tertiary)" />
                <Tooltip contentStyle={{
                  background: 'var(--neo-light-surface)',
                  border: `1px solid var(--neo-light-border)`,
                  borderRadius: 'var(--radius-lg)'
                }} />
                <Legend />
                <Bar dataKey="present" fill="var(--neo-success)" />
                <Bar dataKey="absent" fill="var(--neo-error)" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
