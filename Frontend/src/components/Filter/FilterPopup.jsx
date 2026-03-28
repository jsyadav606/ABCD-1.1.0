import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Button from '../Button/Button.jsx';
import './FilterPopup.css';

/**
 * @typedef {Object} FilterField
 * @property {string} key
 * @property {string} label
 * @property {string} [type]
 * @property {string} value
 * @property {(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void} onChange
 * @property {Array<string>} [options]
 * @property {(option: string) => string} [optionRenderer]
 * @property {string} [placeholder]
 */

/**
 * @typedef {Object} FilterPopupProps
 * @property {boolean} isOpen
 * @property {{current: HTMLElement|null}} anchorRef
 * @property {FilterField[]} fields
 * @property {() => void} [onClose]
 * @property {() => void} [onReset]
 * @property {() => void} [onApply]
 * @property {number} [minWidth]
 */

/**
 * Capitalize first letter of each word
 * @param {string} str
 * @returns {string}
 */
const capitalizeText = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * @param {FilterPopupProps} props
 */
const FilterPopup = ({
  isOpen,
  anchorRef,
  fields = [],
  onClose,
  onReset,
  onApply,
  minWidth = 300,
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isOpen || !anchorRef?.current) {
      return;
    }

    const updatePosition = () => {
      const rect = anchorRef.current.getBoundingClientRect();
      const top = rect.bottom + 8;
      const left = rect.left;
      setPosition({ top, left });
    };

    const handleClickOutside = (event) => {
      const popup = document.getElementById('filter-popup-root');
      if (!popup || !anchorRef.current) return;
      if (!popup.contains(event.target) && !anchorRef.current.contains(event.target)) {
        onClose?.();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, anchorRef, onClose]);

  if (!isOpen) {
    return null;
  }

  const content = (
    <div
      id="filter-popup-root"
      className="filter-popup"
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 2147483647,
        minWidth: `${minWidth}px`,
      }}
    >
      {fields.map((field) => (
        <div key={field.key || field.label} className="filter-row">
          <label>{field.label}</label>
          {field.type === 'select' ? (
            <select value={field.value} onChange={field.onChange}>
              {field.options.map((option) => (
                <option key={option} value={option}>
                  {field.optionRenderer ? field.optionRenderer(option) : capitalizeText(option)}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={field.type || 'text'}
              value={field.value}
              onChange={field.onChange}
              placeholder={field.placeholder || ''}
            />
          )}
        </div>
      ))}

      <div className="filter-actions">
        <Button variant="secondary" size="small" onClick={onReset}>
          Reset
        </Button>
        <Button variant="primary" size="small" onClick={onApply}>
          Apply
        </Button>
      </div>
    </div>
  );

  if (typeof document === 'undefined') {
    return content;
  }

  return createPortal(content, document.body);

};

export default FilterPopup;
