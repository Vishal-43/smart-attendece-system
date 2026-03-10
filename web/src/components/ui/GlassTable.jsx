import './GlassTable.module.css'

export default function GlassTable({ columns, data, onRowClick, isLoading = false, emptyMessage = 'No data available' }) {
  if (isLoading) {
    return <div className="glass-table-skeleton">Loading...</div>
  }

  if (!data || data.length === 0) {
    return <div className="glass-table-empty">{emptyMessage}</div>
  }

  return (
    <div className="glass-table-wrapper">
      <table className="glass-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={`glass-table__header glass-table__header--${col.align || 'left'}`}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr 
              key={rowIdx} 
              className="glass-table__row"
              onClick={() => onRowClick?.(row)}
              style={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              {columns.map((col) => (
                <td 
                  key={`${rowIdx}-${col.key}`} 
                  className={`glass-table__cell glass-table__cell--${col.align || 'left'}`}
                >
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
