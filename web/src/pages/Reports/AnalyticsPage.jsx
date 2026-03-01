import { Card, CardBody, Loading } from '../../components/Common'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useAttendanceSummary, useDivisions } from '../../api/hooks'
import './Reports.css'

export default function AnalyticsPage() {
  const { data: summaryData, isLoading } = useAttendanceSummary({})
  const { data: divisionsData } = useDivisions()
  
  const summary = summaryData?.data?.data || summaryData?.data || {}
  const divisions = divisionsData?.data?.data || divisionsData?.data || []

  const statusData = [
    { name: 'Present', value: summary.present || 0, color: '#10b981' },
    { name: 'Absent', value: summary.absent || 0, color: '#ef4444' },
    { name: 'Late', value: summary.late || 0, color: '#f59e0b' },
  ].filter(item => item.value > 0)

  // Mock division data (in production, you'd fetch per-division stats)
  const divisionData = Array.isArray(divisions) ? divisions.slice(0, 5).map((div, idx) => ({
    name: div.name,
    attendance: Math.floor(75 + Math.random() * 20), // Mock data
  })) : []

  if (isLoading) {
    return <Loading />
  }

  return (
    <div className="reports">
      <div className="reports__header">
        <h1>Analytics &ampInsights</h1>
        <p>Attendance trends and patterns</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '1.5rem' }}>
        <Card>
          <CardBody>
            <h3 style={{ marginTop: 0 }}>Attendance Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              {statusData.length > 0 ? (
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              ) : (
                <p>No data available</p>
              )}
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h3 style={{ marginTop: 0 }}>Division-wise Attendance Rate</h3>
            <ResponsiveContainer width="100%" height={300}>
              {divisionData.length > 0 ? (
                <BarChart data={divisionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="attendance" fill="#4f46e5" name="Attendance %" />
                </BarChart>
              ) : (
                <p>No division data available</p>
              )}
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h3 style={{ marginTop: 0 }}>Overall Summary</h3>
            <div style={{ padding: '1rem 0' }}>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Total Records:</strong> {summary.total || 0}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Attendance Rate:</strong> {(summary.attendance_rate || 0).toFixed(2)}%
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Present:</strong> {summary.present || 0}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Absent:</strong> {summary.absent || 0}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Late:</strong> {summary.late || 0}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
