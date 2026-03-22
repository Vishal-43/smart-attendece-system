import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts'

const BAR_COLORS = {
  Present: '#10B981',
  Absent:  '#EF4444',
  Late:    '#F59E0B',
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const value = payload[0].value
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    }}>
      <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>
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
        color: '#6b7280', 
        fontSize: 14,
        background: '#ffffff',
      }}>
        No statistics available
      </div>
    )
  }

  const total = data.reduce((sum, d) => sum + d.value, 0)
  const dataWithTotal = data.map(d => ({ ...d, total }))

  return (
    <div style={{ background: '#ffffff', width: '100%' }}>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart 
          data={dataWithTotal} 
          margin={{ top: 10, right: 20, left: -20, bottom: 0 }} 
          barCategoryGap="16%"
        >
          <defs>
            {Object.entries(BAR_COLORS).map(([key, color]) => (
              <linearGradient key={key} id={`barGradient${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={1} />
                <stop offset="100%" stopColor={color} stopOpacity={0.7} />
              </linearGradient>
            ))}
          </defs>

          <CartesianGrid 
            strokeDasharray="0" 
            stroke="#e5e7eb" 
            vertical={false} 
            horizontal={true}
          />

          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
            dy={8}
          />

          <YAxis
            tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
            tickCount={4}
            width={32}
          />

          <Tooltip
            cursor={{ fill: '#f3f4f6', radius: 4 }}
            content={<CustomTooltip />}
          />

          <Bar 
            dataKey="value" 
            radius={[8, 8, 4, 4]} 
            maxBarSize={72}
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
                fontSize: 14, 
                fontWeight: 700, 
                fill: '#111827',
              }} 
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}