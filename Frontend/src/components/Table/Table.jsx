import { useMemo, useState, useEffect } from "react";
import "./Table.css";
import TableSearch from "./TableSearch";
import TablePagination from "./TablePagination";
import ColumnSort from "./ColumnSort";

const Table = ({
  columns,
  data = [],
  pageSize = 20,
  showSearch = true,
  showPagination = true,
  onSelectionChange,
  isRowSelectable,
  defaultSortKey = null,
  defaultSortDirection = "asc",
}) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(() => {
    // Initialize page from URL directly to prevent initial render at page 1
    if (!showPagination) return 1;
    const params = new URLSearchParams(window.location.search);
    const urlPage = parseInt(params.get("page"), 10);
    return (urlPage && !isNaN(urlPage) && urlPage > 0) ? urlPage : 1;
  });
  const [selectedRows, setSelectedRows] = useState([]);

  // URL state sync for page persistence - ONLY updates when URL changes externally (like popstate)
  useEffect(() => {
    if (!showPagination) return;
    
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const urlPage = parseInt(params.get("page"), 10);
      if (urlPage && !isNaN(urlPage) && urlPage > 0) {
        setPage(urlPage);
      } else {
        setPage(1);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [showPagination]);

  // Update URL when page changes
  useEffect(() => {
    if (!showPagination) return;

    const params = new URLSearchParams(window.location.search);
    const currentPage = parseInt(params.get("page"), 10) || 1;

    // Only update if changed
    if (currentPage !== page) {
      if (page === 1) {
        params.delete("page");
      } else {
        params.set("page", page);
      }
      
      const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
      // Use pushState so we can navigate back, or replaceState if we just want to update URL
      // replaceState is better for pagination to not clutter history too much, but pushState allows back button to work for pages.
      // Let's use replaceState as per original intent to just "persist" current view.
      window.history.replaceState({}, '', newUrl);
    }
  }, [page, showPagination]);

  const [sortConfig, setSortConfig] = useState({
    key: defaultSortKey,
    direction: defaultSortKey ? defaultSortDirection : null,
  });

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const processedData = useMemo(() => {
    let tempData = [...data];

    if (showSearch && search) {
      tempData = tempData.filter((row) =>
        Object.values(row)
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase()),
      );
    }

    if (sortConfig.key && sortConfig.direction) {
      tempData.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (aVal == null) return 1;
        if (bVal == null) return -1;

        if (typeof aVal === "number") {
          return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
        }

        return sortConfig.direction === "asc"
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
    }

    return tempData;
  }, [data, search, showSearch, sortConfig]);

  // Validate page range when data changes
  useEffect(() => {
    // Skip this validation if no data, or if we are still initializing
    if (!showPagination || data.length === 0) return;
    
    const processedLen = processedData.length;
    const maxPage = Math.ceil(processedLen / pageSize) || 1;
    
    // Only adjust if strictly greater AND we aren't at initial load (prevent flash)
    // Actually, we should allow being at page X if we expect data to be there.
    // But if data changed (deleted), we should go back.
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [processedData.length, pageSize, page, showPagination, data.length]);

  useEffect(() => {
    onSelectionChange?.(selectedRows);
  }, [selectedRows, onSelectionChange]);

  const highlightText = (text, searchValue) => {
    if (!searchValue) return text;
    const regex = new RegExp(`(${searchValue})`, "gi");
    return String(text)
      .split(regex)
      .map((part, index) =>
        part.toLowerCase() === searchValue.toLowerCase() ? (
          <span key={index} className="highlight">
            {part}
          </span>
        ) : (
          part
        ),
      );
  };

  const totalPages = showPagination ? Math.ceil(processedData.length / pageSize) : 1;

  const tableData = showPagination
    ? processedData.slice((page - 1) * pageSize, page * pageSize)
    : processedData;

  const totalItems = processedData.length;
  const startIndex = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = Math.min(totalItems, page * pageSize);

  const canSelectRow = (row) => !isRowSelectable || isRowSelectable(row);

  const toggleRow = (row) => {
    if (!canSelectRow(row)) return;
    setSelectedRows((prev) =>
      prev.includes(row._id) ? prev.filter((id) => id !== row._id) : [...prev, row._id],
    );
  };

  const toggleAll = (checked) => {
    const selectableRows = tableData.filter(canSelectRow);
    const pageIds = selectableRows.map((row) => row._id);
    setSelectedRows((prev) =>
      checked ? [...new Set([...prev, ...pageIds])] : prev.filter((id) => !pageIds.includes(id)),
    );
  };

  return (
    <div className="table">
      {(showSearch || showPagination) && (
        <div className="table__options">
          {showSearch && (
              <TableSearch
                value={search}
                onChange={(val) => {
                  setSearch(val);
                  setPage(1);
                }}
              />
            )}

          <div className="table__options-right">
            

            {showPagination && (
            <div className="table__summary">
              {totalItems === 0 ? (
                '0 to 0 of 0'
              ) : (
                `${startIndex} to ${endIndex} of ${totalItems}`
              )}
            </div>
          )}

            {showPagination && (
              <TablePagination
                page={page}
                totalPages={totalPages}
                onPrev={() => setPage((p) => Math.max(p - 1, 1))}
                onNext={() => setPage((p) => Math.min(p + 1, totalPages))}
              />
            )}
          </div>
        </div>
      )}

      <div className="table__container">
        <table className="table__data">
          <thead>
            <tr>
              <th className="table__checkbox">
                <input
                  type="checkbox"
                  onChange={(e) => toggleAll(e.target.checked)}
                  checked={
                    tableData.filter(canSelectRow).length > 0 &&
                    tableData.filter(canSelectRow).every((row) => selectedRows.includes(row._id))
                  }
                />
              </th>

              {columns.map((col, i) => (
                <th
                  key={i}
                  onClick={() => col.sortable && handleSort(col.key ?? col.accessor)}
                  style={{ cursor: col.sortable ? "pointer" : "default" }}
                >
                  <span className="th-content">
                    {col.header ?? col.Header}

                    {col.sortable && sortConfig.key === (col.key ?? col.accessor) && sortConfig.direction && (
                      <ColumnSort direction={sortConfig.direction} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {tableData.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} align="center">
                  No data found
                </td>
              </tr>
            )}

            {tableData.map((row) => (
              <tr
                key={row._id}
                className={selectedRows.includes(row._id) ? "table__row table__row--selected" : "table__row"}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(row._id)}
                    onChange={() => toggleRow(row)}
                    disabled={!canSelectRow(row)}
                  />
                </td>

                {columns.map((col, i) => (
                  <td key={i}>{col.render ? col.render(row, search) : highlightText(row[col.key ?? col.accessor], search)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
