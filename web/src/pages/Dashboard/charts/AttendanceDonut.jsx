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
      <strong style={{ color: 'var(--ink-primary)' }}>{payload[0].name}</strong>
      <span style={{ marginLeft: 6, fontWeight: 600, color: 'var(--ink-secondary)' }}>{payload[0].value}%</span>
    </div>
  )
}

export default function AttendanceDonut({ data }) {
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
      gap: 24,
      width: '100%',
      height: '100%'
    }}>
      <div style={{ position: 'relative', width: 140, height: 140 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={68}
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
            fontSize: 22,
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
            marginTop: 2, 
            fontWeight: 600, 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em' 
          }}>Present</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 100 }}>
        {data.map(d => (
          <div key={d.name} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13,
            color: 'var(--ink-secondary)',
          }}>
            <div style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: d.color,
              flexShrink: 0,
            }} />
            <span style={{ flex: 1 }}>{d.name}</span>
            <span style={{
              fontWeight: 600,
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