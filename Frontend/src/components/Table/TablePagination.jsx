import "./Table.css";

const TablePagination = ({ page, totalPages, onPrev, onNext }) => {
  return (
    <div className="pagination">
      <button disabled={page === 1} onClick={onPrev}>
        Prev
      </button>

      <span>
        Page {page} of {totalPages || 1}
      </span>

      <button disabled={page === totalPages || totalPages === 0} onClick={onNext}>
        Next
      </button>
    </div>
  );
};

export default TablePagination;
