/**
 * DataTable.jsx
 *
 * A full-featured generic data table with:
 *  - Client-side search (full-row text match)
 *  - Column sort (asc/desc/none cycling)
 *  - External pagination (server-side) OR internal pagination
 *  - Column configuration via columns prop
 *  - Empty / loading / error states
 *  - Optional row-action slot
 *
 * Props:
 *  columns        Array<ColumnDef>   required
 *  data           Array<object>      required
 *  isLoading      boolean            show skeleton
 *  error          string|null        show error banner
 *  searchable     boolean            show search box (default true)
 *  searchPlaceholder string
 *
 *  // Pagination — pass these for server-side paging
 *  page           number             current 1-based page
 *  totalPages     number             total page count
 *  onPageChange   fn(page)           called when user changes page
 *
 *  // If totalPages is omitted, table paginates data client-side
 *  pageSize       number             rows per page (default 10)
 *
 * ColumnDef:
 *  key        string       — row property key (also used as sort key)
 *  header     string       — column header label
 *  render     fn(value, row) → ReactNode   — optional custom render
 *  sortable   boolean      — whether column is sortable (default true)
 *  width      string       — optional CSS width, e.g. "120px"
 *  align      "left"|"center"|"right"  (default "left")
 */

import React, { useMemo, useState, useCallback } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import './DataTable.css';

const PAGE_SIZE_DEFAULT = 10;

function SortIcon({ direction }) {
  if (direction === 'asc')  return <ChevronUp size={14} className="dt-sort-icon dt-sort-icon--active" />;
  if (direction === 'desc') return <ChevronDown size={14} className="dt-sort-icon dt-sort-icon--active" />;
  return <ChevronsUpDown size={14} className="dt-sort-icon" />;
}

function SkeletonRows({ columns, rows = 6 }) {
  return Array.from({ length: rows }).map((_, i) => (
    <tr key={i} className="dt-row dt-row--skeleton">
      {columns.map((col) => (
        <td key={col.key} className="dt-cell">
          <span className="dt-skeleton-line" />
        </td>
      ))}
    </tr>
  ));
}

export default function DataTable({
  columns = [],
  data = [],
  isLoading = false,
  error = null,

  searchable = true,
  searchPlaceholder = 'Search…',

  // Server-side pagination (all three must be provided together)
  page: externalPage,
  totalPages: externalTotalPages,
  onPageChange,

  // Client-side pagination fallback
  pageSize = PAGE_SIZE_DEFAULT,
}) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc'); // 'asc' | 'desc'
  const [internalPage, setInternalPage] = useState(1);

  const isServerPaged = externalPage != null && externalTotalPages != null && onPageChange != null;

  /* ------------------------------------------------------------------ */
  /* Search filter                                                         */
  /* ------------------------------------------------------------------ */
  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const val = row[col.key];
        return val != null && String(val).toLowerCase().includes(q);
      })
    );
  }, [data, search, columns]);

  /* ------------------------------------------------------------------ */
  /* Sort                                                                  */
  /* ------------------------------------------------------------------ */
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  /* ------------------------------------------------------------------ */
  /* Client-side pagination                                                */
  /* ------------------------------------------------------------------ */
  const totalClientPages = Math.max(1, Math.ceil(sorted.length / pageSize));

  const displayRows = useMemo(() => {
    if (isServerPaged) return sorted;
    const start = (internalPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, isServerPaged, internalPage, pageSize]);

  const currentPage  = isServerPaged ? externalPage  : internalPage;
  const totalPagesFinal = isServerPaged ? externalTotalPages : totalClientPages;

  const handlePageChange = useCallback(
    (p) => {
      if (p < 1 || p > totalPagesFinal) return;
      if (isServerPaged) onPageChange(p);
      else setInternalPage(p);
    },
    [isServerPaged, onPageChange, totalPagesFinal]
  );

  const handleSort = useCallback(
    (key) => {
      if (sortKey === key) {
        if (sortDir === 'asc') setSortDir('desc');
        else { setSortKey(null); setSortDir('asc'); }
      } else {
        setSortKey(key);
        setSortDir('asc');
      }
    },
    [sortKey, sortDir]
  );

  /* ------------------------------------------------------------------ */
  /* Render                                                                */
  /* ------------------------------------------------------------------ */
  return (
    <div className="dt-root">
      {/* Toolbar */}
      {searchable && (
        <div className="dt-toolbar">
          <div className="dt-search-wrap">
            <Search size={15} className="dt-search-icon" />
            <input
              type="text"
              className="dt-search"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (!isServerPaged) setInternalPage(1);
              }}
            />
          </div>
          {search && (
            <span className="dt-result-count">
              {sorted.length} result{sorted.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="dt-error" role="alert">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="dt-scroll-wrap">
        <table className="dt-table">
          <thead className="dt-head">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`dt-th ${col.sortable !== false ? 'dt-th--sortable' : ''}`}
                  style={{ width: col.width, textAlign: col.align ?? 'left' }}
                  onClick={col.sortable !== false ? () => handleSort(col.key) : undefined}
                  aria-sort={
                    sortKey === col.key
                      ? sortDir === 'asc' ? 'ascending' : 'descending'
                      : 'none'
                  }
                >
                  <span className="dt-th-inner">
                    {col.header}
                    {col.sortable !== false && (
                      <SortIcon direction={sortKey === col.key ? sortDir : null} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="dt-body">
            {isLoading ? (
              <SkeletonRows columns={columns} />
            ) : displayRows.length === 0 ? (
              <tr>
                <td className="dt-empty" colSpan={columns.length}>
                  {search ? 'No results match your search.' : 'No data available.'}
                </td>
              </tr>
            ) : (
              displayRows.map((row, rowIdx) => (
                <tr key={row.id ?? rowIdx} className="dt-row">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="dt-cell"
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

      {/* Pagination */}
      {totalPagesFinal > 1 && (
        <div className="dt-pagination">
          <span className="dt-page-info">
            Page {currentPage} of {totalPagesFinal}
          </span>
          <div className="dt-page-btns">
            <button
              className="dt-page-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isLoading}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPagesFinal }, (_, i) => i + 1)
              .filter((p) => Math.abs(p - currentPage) <= 2 || p === 1 || p === totalPagesFinal)
              .reduce((acc, p, i, arr) => {
                if (i > 0 && p - arr[i - 1] > 1) acc.push('…');
                acc.push(p);
                return acc;
              }, [])
              .map((item, i) =>
                item === '…' ? (
                  <span key={`ellipsis-${i}`} className="dt-page-ellipsis">…</span>
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
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
