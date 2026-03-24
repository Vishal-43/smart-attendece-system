import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts'

const BAR_COLORS = {
  Present: '#06b6d4',
  Absent:  '#f43f5e',
  Late:    '#f59e0b',
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const value = payload[0].value
  const color = BAR_COLORS[label] || '#ffffff'
  return (
    <div style={{
      background: 'rgba(20, 25, 40, 0.95)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      padding: '14px 18px',
      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.3)',
    }}>
      <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.4)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
      <div style={{ fontSize: '22px', fontWeight: 800, color: color }}>
        {value}
      </div>
    </div>
  )
}

export default function StatsBar({ data }) {
  if (!data || data.every(d => d.value === 0)) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: 180,
        color: 'rgba(255, 255, 255, 0.3)', 
        fontSize: 14,
        background: 'transparent',
      }}>
        No statistics available
      </div>
    )
  }

  const total = data.reduce((sum, d) => sum + d.value, 0)
  const dataWithTotal = data.map(d => ({ ...d, total }))

  return (
    <div style={{ width: '100%', padding: '8px 0' }}>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart 
          data={dataWithTotal} 
          margin={{ top: 10, right: 24, left: -24, bottom: 0 }} 
          barCategoryGap="20%"
        >
          <defs>
            {Object.entries(BAR_COLORS).map(([key, color]) => (
              <linearGradient key={key} id={`barGradient${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={1} />
                <stop offset="100%" stopColor={color} stopOpacity={0.6} />
              </linearGradient>
            ))}
          </defs>

          <CartesianGrid 
            strokeDasharray="0" 
            stroke="rgba(255, 255, 255, 0.05)" 
            vertical={false} 
            horizontal={true}
          />

          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.5)', fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
            dy={10}
          />

          <YAxis
            tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.35)', fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
            tickCount={4}
            width={36}
          />

          <Tooltip
            cursor={{ fill: 'rgba(255, 255, 255, 0.03)', radius: 6 }}
            content={<CustomTooltip />}
          />

          <Bar 
            dataKey="value" 
            radius={[10, 10, 6, 6]} 
            maxBarSize={80}
          >
            {dataWithTotal.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={`url(#barGradient${entry.name})`}
              />
            ))}
            <LabelList 
              dataKey="value" 
              position="top" 
              formatter={(value) => value > 0 ? value : ''}
              style={{ 
                fontSize: 15, 
                fontWeight: 800, 
                fill: '#ffffff',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
              }} 
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
