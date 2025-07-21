import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const CustomDropdown = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select option",
  className = "",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const selectedOption = options.find(option => option.value === value);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className={`
          w-full px-4 py-3 text-left
          bg-gray-800 border border-gray-600 rounded-xl
          text-white placeholder-gray-400
          transition-all duration-300 ease-out
          hover:bg-gray-700 hover:border-gray-500
          focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isOpen ? 'bg-gray-700 border-amber-500/50' : ''}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby="dropdown-label"
      >
        <div className="flex items-center justify-between">
          <span className={`${selectedOption ? 'text-white' : 'text-gray-400'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDownIcon 
            className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2">
          <div className="
            bg-gray-800 border border-gray-600 rounded-xl
            shadow-2xl shadow-black/50
            overflow-hidden
            animate-in slide-in-from-top-2 duration-200
          ">
            <ul 
              className="py-2 max-h-60 overflow-auto"
              role="listbox"
              aria-labelledby="dropdown-label"
            >
              {options.map((option) => (
                <li key={option.value} role="option">
                  <button
                    type="button"
                    className={`
                      w-full px-4 py-3 text-left
                      transition-all duration-200 ease-out
                      hover:bg-gray-700 hover:text-amber-400
                      focus:outline-none focus:bg-gray-700 focus:text-amber-400
                      ${option.value === value ? 'bg-amber-600/20 text-amber-400' : 'text-white'}
                    `}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onChange(option.value);
                        setIsOpen(false);
                      }
                    }}
                  >
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown; 