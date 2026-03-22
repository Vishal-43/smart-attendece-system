import { useEffect, useState } from 'react'
import { Card, CardBody, Loading } from '../../components/Common'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useAttendanceSummary } from '../../api/hooks'
import { getDivisionAttendance } from '../../api/services'
import './Reports.css'

export default function AnalyticsPage() {
  const { data: summaryData, isLoading } = useAttendanceSummary({ enableQuery: true })
  const [divisionData, setDivisionData] = useState([])

  const summary = summaryData?.data || {}

  useEffect(() => {
    const fetchDivisionAnalytics = async () => {
      try {
        const response = await getDivisionAttendance({})
        const items = response?.data || []
        setDivisionData(items.map(item => ({
          name: item.division_name,
          attendance: item.attendance_rate,
        })))
      } catch { setDivisionData([]) }
    }
    fetchDivisionAnalytics()
  }, [])

  const statusData = [
    { name: 'Present', value: summary.present || 0, color: '#0A0A0A' },
    { name: 'Absent', value: summary.absent || 0, color: '#EF4444' },
    { name: 'Late', value: summary.late || 0, color: '#F59E0B' },
  ].filter(item => item.value > 0)

  if (isLoading) return <Loading />

  return (
    <div className="page-inner">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Attendance trends and patterns</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '14px' }}>
        <Card>
          <CardBody>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-900)', margin: '0 0 14px' }}>Attendance Distribution</h3>
            <ResponsiveContainer width="100%" height={280}>
              {statusData.length > 0 ? (
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={110}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              ) : (
                <p style={{ color: 'var(--ink-500)', textAlign: 'center' }}>No data available</p>
              )}
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-900)', margin: '0 0 14px' }}>Division Attendance Rate</h3>
            <ResponsiveContainer width="100%" height={280}>
              {divisionData.length > 0 ? (
                <BarChart data={divisionData}>
                  <CartesianGrid strokeDasharray="0" stroke="transparent" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--ink-500)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--ink-500)' }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="attendance" fill="#0A0A0A" radius={[4, 4, 2, 2]} />
                </BarChart>
              ) : (
                <p style={{ color: 'var(--ink-500)', textAlign: 'center' }}>No division data available</p>
              )}
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-900)', margin: '0 0 14px' }}>Overall Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ['Total Records', summary.total || 0],
                ['Present', summary.present || 0],
                ['Absent', summary.absent || 0],
                ['Late', summary.late || 0],
                ['Attendance Rate', `${(summary.attendance_rate || 0).toFixed(2)}%`],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 13, color: 'var(--ink-500)' }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-900)' }}>{value}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
