export const ErrorNotification = ({ error, onClose }) => {
  if (!error) return null

  const message = error?.message || 'An error occurred'

  return (
    <div style={{
      backgroundColor: '#fee',
      border: '1px solid #fcc',
      borderRadius: '6px',
      padding: '1rem',
      marginBottom: '1rem',
      color: '#c33',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      animation: 'slideIn 0.3s ease'
    }}>
      <div>
        <strong>Error:</strong> {message}
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          fontSize: '1.5rem',
          cursor: 'pointer',
          color: '#c33'
        }}
      >
        ×
      </button>
      <style>{`
        @keyframes slideIn {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
