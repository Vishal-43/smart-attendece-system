import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '10px 14px',
      boxShadow: 'var(--shadow-lg)',
    }}>
      <div style={{ color: 'var(--ink-hint)', marginBottom: 4, fontSize: 11, fontWeight: 600 }}>{label}</div>
      <strong style={{ color: 'var(--primary)', fontSize: 16, fontWeight: 700 }}>{payload[0].value}</strong>
      <span style={{ color: 'var(--ink-secondary)', marginLeft: 4, fontSize: 12 }}>present</span>
    </div>
  )
}

export default function TrendLine({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%',
        minHeight: 140,
        color: 'var(--ink-hint)', 
        fontSize: 14 
      }}>
        No trend data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 20, right: 20, left: -24, bottom: 0 }}>
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />

        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: 'var(--ink-hint)', fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          dy={10}
        />

        <YAxis
          tick={{ fontSize: 11, fill: 'var(--ink-hint)', fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          tickCount={4}
          width={36}
        />

        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: 'var(--primary)', strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.5 }}
        />

        <Area
          type="monotone"
          dataKey="count"
          stroke="#6366f1"
          strokeWidth={2.5}
          fill="url(#trendGradient)"
          dot={{
            r: 4,
            fill: '#6366f1',
            strokeWidth: 0,
          }}
          activeDot={{
            r: 6,
            fill: '#6366f1',
            stroke: 'var(--bg-card)',
            strokeWidth: 3,
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
