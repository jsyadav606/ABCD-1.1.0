import { useRef } from 'react';
import './Modal.css';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeButton = true,
  className = '',
}) => {
  if (!isOpen) return null;

  const overlayRef = useRef(null);
  const pointerDownInsideRef = useRef(false);

  const handleOverlayMouseDown = (e) => {
    // If mousedown on overlay, mark as started outside
    if (e.target === overlayRef.current) {
      pointerDownInsideRef.current = false;
    }
  };

  const handleOverlayMouseUp = (e) => {
    // Close only when both down and up happened on overlay (outside)
    if (e.target === overlayRef.current && pointerDownInsideRef.current === false) {
      onClose?.();
    }
  };

  const handleContentMouseDown = (e) => {
    // Mark that interaction started inside; do not close even if mouseup goes outside
    pointerDownInsideRef.current = true;
    e.stopPropagation();
  };

  return (
    <div
      className="modal-overlay"
      ref={overlayRef}
      onMouseDown={handleOverlayMouseDown}
      onMouseUp={handleOverlayMouseUp}
    >
      <div
        className={`modal modal-${size} ${className}`}
        onMouseDown={handleContentMouseDown}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          {closeButton && (
            <button
              className="modal-close"
              onClick={onClose}
              aria-label="Close modal"
            >
              ✕
            </button>
          )}
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
