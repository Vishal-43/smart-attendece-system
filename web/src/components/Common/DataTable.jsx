/**
 * DataTable.jsx
 * Full-featured generic data table with:
 *  - Client-side search
 *  - Column sort (asc/desc/none cycling)
 *  - Server-side or client-side pagination
 *  - Toolbar with title, search, and optional add button
 *  - Avatar cells, action buttons, status cells
 *  - Error / loading / empty states
 */

import React, { useMemo, useState, useCallback } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import './components.css';

const PAGE_SIZE_DEFAULT = 10;

function SortIcon({ direction }) {
  if (direction === 'asc')  return <ChevronUp size={12} className="dt-sort-icon dt-sort-icon--active" />;
  if (direction === 'desc') return <ChevronDown size={12} className="dt-sort-icon dt-sort-icon--active" />;
  return <ChevronsUpDown size={12} className="dt-sort-icon" />;
}

function SkeletonRows({ columns, rows = 5 }) {
  return Array.from({ length: rows }).map((_, i) => (
    <tr key={i} className="dt-row--skeleton">
      {columns.map((col) => (
        <td key={col.key}>
          <span className="skeleton" style={{ height: 14, width: '70%', display: 'block' }} />
        </td>
      ))}
    </tr>
  ));
}

export default function DataTable({
  title,
  addLabel,
  onAdd,
  columns = [],
  data = [],
  isLoading = false,
  error = null,
  searchable = true,
  searchPlaceholder = 'Search…',
  filters,
  page: externalPage,
  totalPages: externalTotalPages,
  onPageChange,
  pageSize = PAGE_SIZE_DEFAULT,
  emptyMessage = 'No data available.',
  searchEmptyMessage = 'No results match your search.',
}) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [internalPage, setInternalPage] = useState(1);

  const isServerPaged = externalPage != null && externalTotalPages != null && onPageChange != null;

  /* Search */
  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(row =>
      columns.some(col => {
        const val = row[col.key];
        return val != null && String(val).toLowerCase().includes(q);
      })
    );
  }, [data, search, columns]);

  /* Sort */
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  /* Pagination */
  const totalClientPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const displayRows = useMemo(() => {
    if (isServerPaged) return sorted;
    const start = (internalPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, isServerPaged, internalPage, pageSize]);

  const currentPage = isServerPaged ? externalPage : internalPage;
  const totalPagesFinal = isServerPaged ? externalTotalPages : totalClientPages;

  const handlePageChange = useCallback((p) => {
    if (p < 1 || p > totalPagesFinal) return;
    if (isServerPaged) onPageChange(p);
    else setInternalPage(p);
  }, [isServerPaged, onPageChange, totalPagesFinal]);

  const handleSort = useCallback((key) => {
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc');
      else { setSortKey(null); setSortDir('asc'); }
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }, [sortKey, sortDir]);

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, sorted.length);

  return (
    <div className="dt-card">
      {/* Toolbar */}
      {(title || searchable || addLabel || filters) && (
        <div className="dt-toolbar">
          {title && <span className="dt-title">{title}</span>}
          {searchable && (
            <div className="dt-search" style={{ marginLeft: title ? undefined : 0 }}>
              <Search size={12} strokeWidth={1.75} />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (!isServerPaged) setInternalPage(1);
                }}
              />
            </div>
          )}
          {filters && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{filters}</div>}
          {addLabel && (
            <button className="dt-add-btn" onClick={onAdd} style={{ marginLeft: 'auto' }}>
              <Plus size={13} strokeWidth={2} />
              {addLabel}
            </button>
          )}
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div style={{
          padding: '12px 18px',
          background: 'var(--red-bg)',
          color: 'var(--red-text)',
          fontSize: 13,
          borderBottom: '0.5px solid var(--border)'
        }}>
          {error}
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="dt-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={col.sortable !== false ? 'sortable' : ''}
                  style={{ width: col.width, textAlign: col.align ?? 'left' }}
                  onClick={col.sortable !== false ? () => handleSort(col.key) : undefined}
                  aria-sort={
                    sortKey === col.key
                      ? sortDir === 'asc' ? 'ascending' : 'descending'
                      : 'none'
                  }
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {col.header}
                    {col.sortable !== false && (
                      <SortIcon direction={sortKey === col.key ? sortDir : null} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <SkeletonRows columns={columns} />
            ) : displayRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{
                  padding: '48px',
                  textAlign: 'center',
                  color: 'var(--ink-hint)',
                  fontSize: 13
                }}>
                  {search ? searchEmptyMessage : emptyMessage}
                </td>
              </tr>
            ) : (
              displayRows.map((row, rowIdx) => (
                <tr key={row.id ?? rowIdx}>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={{ textAlign: col.align ?? 'left' }}
                    >
                      {col.render
                        ? col.render(row[col.key], row)
                        : row[col.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer with pagination */}
      {(totalPagesFinal > 1 || sorted.length > 0) && (
        <div className="dt-footer">
          {sorted.length > 0 ? (
            <span className="dt-count">
              Showing {startItem}–{endItem} of {sorted.length}
            </span>
          ) : (
            <span className="dt-count">No results</span>
          )}
          {totalPagesFinal > 1 && (
            <div className="dt-pagination">
              <button
                className="dt-page-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || isLoading}
                aria-label="Previous page"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPagesFinal }, (_, i) => i + 1)
                .filter(p => Math.abs(p - currentPage) <= 2 || p === 1 || p === totalPagesFinal)
                .reduce((acc, p, i, arr) => {
                  if (i > 0 && p - arr[i - 1] > 1) acc.push('…');
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, i) =>
                  item === '…' ? (
                    <span key={`ellipsis-${i}`} style={{
                      width: 28,
                      height: 28,
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 12,
                      color: 'var(--ink-hint)'
                    }}>…</span>
                  ) : (
                    <button
                      key={item}
                      className={`dt-page-btn ${item === currentPage ? 'dt-page-btn--active' : ''}`}
                      onClick={() => handlePageChange(item)}
                      disabled={isLoading}
                      aria-current={item === currentPage ? 'page' : undefined}
                    >
                      {item}
                    </button>
                  )
                )}
              <button
                className="dt-page-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPagesFinal || isLoading}
                aria-label="Next page"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
