import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const CustomDropdown = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select option",
  className = "",
  disabled = false,
  searchable = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, searchable]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const selectedOption = options.find(option => option.value === value);

  // Filter options based on search term
  const filteredOptions = searchable && searchTerm 
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Sort filtered options to show exact matches first, then partial matches
  const sortedOptions = searchable && searchTerm 
    ? [...filteredOptions].sort((a, b) => {
        const aLower = a.label.toLowerCase();
        const bLower = b.label.toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        
        // Exact matches first
        if (aLower === searchLower && bLower !== searchLower) return -1;
        if (bLower === searchLower && aLower !== searchLower) return 1;
        
        // Starts with search term
        if (aLower.startsWith(searchLower) && !bLower.startsWith(searchLower)) return -1;
        if (bLower.startsWith(searchLower) && !aLower.startsWith(searchLower)) return 1;
        
        // Alphabetical order for remaining matches
        return aLower.localeCompare(bLower);
      })
    : filteredOptions;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className={`
          w-full px-4 py-3 text-left
          bg-white/10 border border-white/20 rounded-xl
          text-white placeholder-gray-400
          transition-all duration-300 ease-out
          hover:bg-white/15 hover:border-white/30
          focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isOpen ? 'bg-white/15 border-amber-400' : ''}
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
            className={`w-5 h-5 text-white transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-[9999] w-full mt-2">
          <div className="
            bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]/95 backdrop-blur-xl border border-white/20 rounded-xl
            shadow-2xl shadow-black/70
            overflow-hidden
            animate-in slide-in-from-top-2 duration-200
          ">
            {/* Search Input */}
            {searchable && (
              <div className="p-3 border-b border-white/10 bg-gradient-to-r from-[#0f0c29] to-[#302b63]/90">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setIsOpen(false);
                        setSearchTerm('');
                      }
                    }}
                  />
                </div>
              </div>
            )}

            <ul 
              className="py-2 max-h-60 overflow-auto bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e]/95"
              role="listbox"
              aria-labelledby="dropdown-label"
            >
              {sortedOptions.length === 0 ? (
                <li className="px-4 py-3 text-gray-400 text-sm text-center">
                  {searchTerm ? 'No matches found' : 'No options available'}
                </li>
              ) : (
                sortedOptions.map((option) => (
                  <li key={option.value} role="option">
                    <button
                      type="button"
                      className={`
                        w-full px-4 py-3 text-left
                        transition-all duration-200 ease-out
                        hover:bg-white/15 hover:text-amber-400
                        focus:outline-none focus:bg-white/15 focus:text-amber-400
                        ${option.value === value ? 'bg-amber-500 text-white' : 'text-white'}
                      `}
                      onClick={() => {
                        onChange(option.value);
                        setIsOpen(false);
                        setSearchTerm('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onChange(option.value);
                          setIsOpen(false);
                          setSearchTerm('');
                        }
                      }}
                    >
                      {option.label}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown; 