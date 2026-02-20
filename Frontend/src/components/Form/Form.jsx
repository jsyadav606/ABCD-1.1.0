import './Form.css';

const Form = ({
  children,
  onSubmit,
  className = '',
  ...props
}) => {
  return (
    <form className={`form ${className}`} onSubmit={onSubmit} {...props}>
      {children}
    </form>
  );
};

export default Form;
