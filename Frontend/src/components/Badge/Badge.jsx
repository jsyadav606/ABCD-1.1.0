import './Badge.css';

const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  rounded = false,
  className = '',
}) => {
  return (
    <span
      className={`badge badge-${variant} badge-${size} ${
        rounded ? 'badge-rounded' : ''
      } ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
