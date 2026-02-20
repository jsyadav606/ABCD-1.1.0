const ColumnSort = ({ direction }) => {
  return (
    <div className="column-sort">
      <span className={direction === "asc" ? "active" : ""}>▲</span>
      <span className={direction === "desc" ? "active" : ""}>▼</span>
    </div>
  );
};

export default ColumnSort;
