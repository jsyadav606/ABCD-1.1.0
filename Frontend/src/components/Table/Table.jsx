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
  defaultSortKey = null,
  defaultSortDirection = "asc",
}) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);

  const [sortConfig, setSortConfig] = useState({
    key: defaultSortKey,
    direction: defaultSortKey ? defaultSortDirection : null,
  });

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

  const totalPages = showPagination ? Math.ceil(processedData.length / pageSize) : 1;

  const tableData = showPagination
    ? processedData.slice((page - 1) * pageSize, page * pageSize)
    : processedData;

  const totalItems = processedData.length;
  const startIndex = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = Math.min(totalItems, page * pageSize);

  const toggleRow = (row) => {
    setSelectedRows((prev) =>
      prev.includes(row._id) ? prev.filter((id) => id !== row._id) : [...prev, row._id],
    );
  };

  const toggleAll = (checked) => {
    const pageIds = tableData.map((row) => row._id);
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
                    tableData.length > 0 && tableData.every((row) => selectedRows.includes(row._id))
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
                  <input type="checkbox" checked={selectedRows.includes(row._id)} onChange={() => toggleRow(row)} />
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
