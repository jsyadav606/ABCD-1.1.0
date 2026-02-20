import './Breadcrumb.css';

const Breadcrumb = ({ items = [], separator = '/' }) => {
  return (
    <nav className="breadcrumb" aria-label="breadcrumb">
      <ol className="breadcrumb-list">
        {items.map((item, idx) => (
          <li key={idx} className="breadcrumb-item">
            {item.href ? (
              <a href={item.href}>{item.label}</a>
            ) : (
              <span>{item.label}</span>
            )}
            {idx < items.length - 1 && (
              <span className="breadcrumb-separator">{separator}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
