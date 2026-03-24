import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const CustomTooltip = ({ active, payload }) => {
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
      <strong>{payload[0].name}</strong>
      <span style={{ marginLeft: 8, fontWeight: 700, color: payload[0].payload.color }}>{payload[0].value}%</span>
    </div>
  )
}

export default function AttendanceDonut({ data }) {
  if (!data || data.length === 0 || data.every(d => d.value === 0)) {
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
        No attendance data available
      </div>
    )
  }

  const presentValue = data.find(d => d.name === 'Present')?.value ?? 0

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      gap: 28,
      width: '100%',
      height: '100%'
    }}>
      <div style={{ position: 'relative', width: 150, height: 150 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={72}
              paddingAngle={3}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              strokeWidth={0}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none'
        }}>
          <div style={{
            fontSize: 26,
            fontWeight: 800,
            color: 'var(--ink-primary)',
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}>
            {Math.round(presentValue)}%
          </div>
          <div style={{ 
            fontSize: 10, 
            color: 'var(--ink-hint)', 
            marginTop: 4, 
            fontWeight: 600, 
            textTransform: 'uppercase', 
            letterSpacing: '0.06em' 
          }}>Present</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 110 }}>
        {data.map(d => (
          <div key={d.name} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 13,
            color: 'var(--ink-secondary)',
          }}>
            <div style={{
              width: 11,
              height: 11,
              borderRadius: '50%',
              background: d.color,
              flexShrink: 0,
              boxShadow: `0 2px 8px ${d.color}40`,
            }} />
            <span style={{ flex: 1 }}>{d.name}</span>
            <span style={{
              fontWeight: 700,
              color: 'var(--ink-primary)',
            }}>
              {d.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
