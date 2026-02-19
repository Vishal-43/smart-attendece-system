import clsx from 'clsx'
import './Table.css'

export default function Table({
  columns = [],
  data = [],
  loading = false,
  className,
}) {
  return (
    <div className={clsx('table-wrapper', className)}>
      <table className="table">
        <thead className="table__head">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="table__header">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="table__body">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="table__empty">
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="table__empty">
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={idx} className="table__row">
                {columns.map((col) => (
                  <td key={col.key} className="table__cell">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
