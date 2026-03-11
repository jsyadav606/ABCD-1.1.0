/**
 * Modal Component
 * 
 * Logics:
 * - Controlled visibility via isOpen prop.
 * - Overlay Close Behavior:
 *   Closes only when both mousedown and mouseup occur on overlay;
 *   prevents accidental close when drag starts inside and ends outside.
 * - Structure:
 *   Header with optional close button, body for children, optional footer area.
 */
import { useRef } from 'react';
import { createPortal } from 'react-dom';
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
  const overlayRef = useRef(null);
  const pointerDownInsideRef = useRef(false);

  if (!isOpen) return null;

  const handleOverlayMouseDown = (e) => {
    if (e.target === overlayRef.current) {
      pointerDownInsideRef.current = false;
    }
  };

  const handleOverlayMouseUp = (e) => {
    if (e.target === overlayRef.current && pointerDownInsideRef.current === false) {
      onClose?.();
    }
  };

  const handleContentMouseDown = (e) => {
    pointerDownInsideRef.current = true;
    e.stopPropagation();
  };

  return createPortal(
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
  , document.body);
};

export default Modal;
