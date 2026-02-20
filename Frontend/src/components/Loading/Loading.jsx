import './Loading.css';

const Loading = ({
  type = 'spinner',
  size = 'md',
  text = 'Loading...',
  fullScreen = false,
}) => {
  return (
    <div className={`loading ${fullScreen ? 'loading-fullscreen' : ''}`}>
      {type === 'spinner' && (
        <div className={`spinner spinner-${size}`}></div>
      )}
      {type === 'dots' && <div className={`dots dots-${size}`}></div>}
      {type === 'bar' && <div className={`progress-bar progress-bar-${size}`}></div>}
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

export default Loading;
