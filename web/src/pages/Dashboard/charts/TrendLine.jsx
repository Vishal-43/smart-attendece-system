import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '10px 14px',
      fontSize: '12px',
      color: 'var(--ink-primary)',
      boxShadow: 'var(--shadow-lg)',
    }}>
      <div style={{ color: 'var(--ink-hint)', marginBottom: 4, fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
      <strong style={{ color: 'var(--info)' }}>{payload[0].value}</strong>
      <span style={{ color: 'var(--ink-secondary)', marginLeft: 4 }}>present</span>
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
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={data} margin={{ top: 16, right: 16, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--info)" stopOpacity={0.15} />
            <stop offset="100%" stopColor="var(--info)" stopOpacity={0.02} />
          </linearGradient>
        </defs>

        <CartesianGrid stroke="transparent" vertical={false} horizontal={false} />

        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: 'var(--ink-hint)' }}
          axisLine={false}
          tickLine={false}
          dy={8}
        />

        <YAxis
          tick={{ fontSize: 10, fill: 'var(--ink-hint)' }}
          axisLine={false}
          tickLine={false}
          tickCount={4}
          width={32}
        />

        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: 'var(--border-hover)', strokeWidth: 1, strokeDasharray: '4 4' }}
        />

        <Area
          type="monotone"
          dataKey="count"
          stroke="var(--info)"
          strokeWidth={2}
          fill="url(#trendGradient)"
          dot={{
            r: 3,
            fill: 'var(--info)',
            strokeWidth: 0,
          }}
          activeDot={{
            r: 5,
            fill: 'var(--info)',
            stroke: 'var(--bg-card)',
            strokeWidth: 2,
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}