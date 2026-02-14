import { Card, CardBody } from '../../components/Common'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import './Reports.css'

export default function AnalyticsPage() {
  const mockData = [
    { name: 'Week 1', value: 85 },
    { name: 'Week 2', value: 88 },
    { name: 'Week 3', value: 82 },
    { name: 'Week 4', value: 90 },
  ]

  return (
    <div className="reports">
      <div className="reports__header">
        <h1>Analytics &amp; Insights</h1>
        <p>Attendance trends and patterns</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '1.5rem' }}>
        <Card>
          <CardBody>
            <h3 style={{ marginTop: 0 }}>Weekly Attendance Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h3 style={{ marginTop: 0 }}>Division Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
