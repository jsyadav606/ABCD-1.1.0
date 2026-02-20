import './Checkbox.css';

const Checkbox = ({
  name,
  label,
  checked = false,
  onChange,
  disabled = false,
  error = '',
  className = '',
  ...props
}) => {
  return (
    <div className="checkbox-wrapper">
      <label className={`checkbox-label ${disabled ? 'disabled' : ''}`}>
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={`checkbox-input ${error ? 'checkbox-error' : ''} ${className}`}
          {...props}
        />
        <span className="checkbox-custom"></span>
        <span className="checkbox-text">{label}</span>
      </label>
      {error && <span className="checkbox-error-text">{error}</span>}
    </div>
  );
};

export default Checkbox;
