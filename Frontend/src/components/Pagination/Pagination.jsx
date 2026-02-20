import './Pagination.css';

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  showFirst = true,
  showLast = true,
  size = 'md',
  // new props
  showSummary = false,
  totalItems = 0,
  pageSize = 10,
}) => {
  const pages = [];
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);

  if (showFirst && startPage > 1) {
    pages.push(1);
    if (startPage > 2) pages.push('...');
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (showLast && endPage < totalPages) {
    if (endPage < totalPages - 1) pages.push('...');
    pages.push(totalPages);
  }

  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(totalItems, currentPage * pageSize);

  return (
    <nav className={`pagination pagination-${size}`}>
      {showSummary && (
        <div className="pagination-summary">
          {totalItems === 0
            ? '0 to 0 of 0'
            : `${startIndex} to ${endIndex} of ${totalItems}`}
        </div>
      )}

      <div className="pagination-controls">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-btn pagination-prev"
        >
          ← Previous
        </button>

        <div className="pagination-pages">
          {pages.map((page, idx) =>
            page === '...' ? (
              <span key={idx} className="pagination-dots">
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`pagination-btn ${
                  page === currentPage ? 'pagination-active' : ''
                }`}
              >
                {page}
              </button>
            )
          )}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-btn pagination-next"
        >
          Next →
        </button>
      </div>
    </nav>
  );
};

export default Pagination;
