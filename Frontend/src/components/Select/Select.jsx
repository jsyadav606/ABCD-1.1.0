import './Select.css';

const Select = ({
  name,
  label,
  value,
  onChange,
  onBlur,
  options = [],
  error = '',
  required = false,
  disabled = false,
  placeholder = 'Select an option',
  className = '',
  ...props
}) => {
  return (
    <div className="select-wrapper">
      {label && (
        <label htmlFor={name} className="select-label">
          {label}
          {required && <span className="select-required">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        className={`select-field ${error ? 'select-error' : ''} ${className}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="select-error-text">{error}</span>}
    </div>
  );
};

export default Select;
