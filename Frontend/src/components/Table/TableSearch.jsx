import "./Table.css";

const TableSearch = ({ value, onChange }) => {
  return (
    <input
      className="table-search"
      placeholder="Search..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

export default TableSearch;
