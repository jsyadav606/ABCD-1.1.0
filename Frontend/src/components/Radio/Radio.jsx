import './Radio.css';

const Radio = ({
  name,
  label,
  value,
  checked = false,
  onChange,
  disabled = false,
  error = '',
  className = '',
  ...props
}) => {
  return (
    <div className="radio-wrapper">
      <label className={`radio-label ${disabled ? 'disabled' : ''}`}>
        <input
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={`radio-input ${error ? 'radio-error' : ''} ${className}`}
          {...props}
        />
        <span className="radio-custom"></span>
        <span className="radio-text">{label}</span>
      </label>
      {error && <span className="radio-error-text">{error}</span>}
    </div>
  );
};

export default Radio;
