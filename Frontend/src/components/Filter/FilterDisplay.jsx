import './FilterDisplay.css';

/**
 * FilterDisplay Component
 * Displays active filters in a beautiful, reusable format
 * 
 * @component
 * @param {Object} props
 * @param {Array} props.filters - Array of filter objects with shape {label: string, value: string}
 * @param {string} [props.className] - Optional additional CSS class for page-specific styling
 * 
 * @example
 * const filters = [
 *   { label: 'Branch', value: 'Mumbai' },
 *   { label: 'Status', value: 'Active' }
 * ];
 * <FilterDisplay filters={filters} />
 */
const FilterDisplay = ({ filters = [], className = '' }) => {
  return (
    <div className={`filter-display-row ${className}`}>
      <span className="filter-display-label">Filters:</span>
      <div className="filter-display-chips">
        {filters && filters.length > 0 ? (
          filters.map((filter, idx) => (
            <span key={idx} className="filter-chip">
              {filter.label}
              <span style={{ margin: '0 6px' }}>:</span>
              <strong>{filter.value}</strong>
            </span>
          ))
        ) : (
          <span className="filter-chip-empty">No filters applied</span>
        )}
      </div>
    </div>
  );
};

export default FilterDisplay;
