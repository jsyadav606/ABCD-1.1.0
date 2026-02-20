import './Textarea.css';

const Textarea = ({
  name,
  label,
  value,
  onChange,
  onBlur,
  placeholder = '',
  error = '',
  required = false,
  disabled = false,
  rows = 4,
  className = '',
  ...props
}) => {
  return (
    <div className="textarea-wrapper">
      {label && (
        <label htmlFor={name} className="textarea-label">
          {label}
          {required && <span className="textarea-required">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={`textarea-field ${error ? 'textarea-error' : ''} ${className}`}
        {...props}
      />
      {error && <span className="textarea-error-text">{error}</span>}
    </div>
  );
};

export default Textarea;
