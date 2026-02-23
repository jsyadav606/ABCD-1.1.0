import { useState, useRef, useEffect } from 'react';
import './MultiSelectBranch.css';

const MultiSelectBranch = ({
  name,
  label,
  value = [],
  onChange,
  options = [],
  error = '',
  required = false,
  disabled = false,
  placeholder = 'Select branches...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  const handleToggle = (optionValue) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];

    // Create synthetic event to match form handler
    onChange({
      target: {
        name,
        value: newValue,
        selectedOptions: newValue,
      },
    });

    // Keep dropdown open after selection
    setIsOpen(true);
  };

  const getSelectedLabels = () => {
    return options
      .filter((opt) => value.includes(opt.value))
      .map((opt) => opt.label);
  };

  const selectedLabels = getSelectedLabels();

  return (
    <div className="multi-select-wrapper">
      {label && (
        <label className="multi-select-label">
          {label}
          {required && <span className="multi-select-required">*</span>}
        </label>
      )}

      <div className="multi-select-container">
        <button
          ref={buttonRef}
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={`multi-select-button ${error ? 'multi-select-error' : ''} ${
            isOpen ? 'multi-select-open' : ''
          }`}
        >
          <div className="multi-select-button-content">
            {selectedLabels.length === 0 ? (
              <span className="multi-select-placeholder">{placeholder}</span>
            ) : (
              <div className="multi-select-chips">
                {selectedLabels.map((label, idx) => (
                  <span key={idx} className="multi-select-chip">
                    {label}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const optionValue = options.find(
                          (opt) => opt.label === label,
                        )?.value;
                        handleToggle(optionValue);
                      }}
                      className="multi-select-chip-remove"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <span className={`multi-select-arrow ${isOpen ? 'multi-select-arrow-up' : ''}`}>
            ▼
          </span>
        </button>

        {isOpen && (
          <div 
            ref={dropdownRef} 
            className="multi-select-dropdown"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {options.length === 0 ? (
              <div className="multi-select-empty">No options available</div>
            ) : (
              options.map((option) => (
                <label key={option.value} className="multi-select-option">
                  <input
                    type="checkbox"
                    checked={value.includes(option.value)}
                    onChange={() => handleToggle(option.value)}
                    className="multi-select-checkbox"
                  />
                  <span className="multi-select-option-label">{option.label}</span>
                </label>
              ))
            )}
          </div>
        )}
      </div>

      {error && <span className="multi-select-error-text">{error}</span>}
    </div>
  );
};

export default MultiSelectBranch;
