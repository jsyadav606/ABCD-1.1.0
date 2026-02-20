import './Alert.css';

const Alert = ({
  type = 'info',
  title,
  children,
  closable = true,
  onClose,
  className = '',
}) => {
  return (
    <div className={`alert alert-${type} ${className}`} role="alert">
      <div className="alert-content">
        {title && <h4 className="alert-title">{title}</h4>}
        <div className="alert-message">{children}</div>
      </div>
      {closable && (
        <button
          className="alert-close"
          onClick={onClose}
          aria-label="Close alert"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Alert;
