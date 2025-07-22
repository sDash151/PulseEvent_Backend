import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Button from '../ui/Button';
import api from '../../services/api';
import QRCodeUpload from '../QRCodeUpload';

// Mobile Date Time Picker Component
const MobileDateTimePicker = ({ value, onChange, label, minDate, maxDate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : new Date());
  
  // Generate arrays for picker options
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleOpen = () => {
    setIsOpen(true);
    // Prevent body scroll when picker is open
    document.body.style.overflow = 'hidden';
  };

  const handleClose = () => {
    setIsOpen(false);
    // Restore body scroll
    document.body.style.overflow = '';
  };

  const handleConfirm = () => {
    onChange(selectedDate.toISOString().slice(0, 16));
    handleClose();
  };

  const handleCancel = () => {
    setSelectedDate(value ? new Date(value) : new Date());
    handleClose();
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  const updateDate = (type, value) => {
    const newDate = new Date(selectedDate);
    switch (type) {
      case 'year':
        newDate.setFullYear(value);
        break;
      case 'month':
        newDate.setMonth(value);
        break;
      case 'day':
        newDate.setDate(value);
        break;
      case 'hour':
        newDate.setHours(value);
        break;
      case 'minute':
        newDate.setMinutes(value);
        break;
      default:
        break;
    }
    setSelectedDate(newDate);
  };

  // Cleanup effect to restore body scroll
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleOpen();
        }}
        className="w-full px-4 py-3 rounded-2xl bg-gray-800 md:bg-[#302b63] text-white font-semibold border border-gray-600 md:border-white/20 shadow-none md:shadow focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400/60 hover:bg-gray-700 md:hover:bg-[#3a3470] transition duration-200 text-left"
      >
        <div className="flex justify-between items-center">
          <span className="text-gray-300 text-sm">{label}</span>
          <span className="text-white">
            {value ? `${formatDate(new Date(value))} ${formatTime(new Date(value))}` : 'Select date & time'}
          </span>
        </div>
      </button>

      {/* Mobile Picker Modal - Rendered via Portal */}
      {isOpen && createPortal(
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] md:hidden p-4"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999
          }}
          onClick={handleBackdropClick}
        >
          <div 
            className="w-full max-w-sm bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl border border-gray-700 shadow-2xl overflow-hidden transform transition-all duration-300 ease-out scale-100 opacity-100"
            style={{
              position: 'relative',
              zIndex: 10000,
              maxHeight: '80vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCancel();
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <h3 className="text-white font-semibold">{label}</h3>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleConfirm();
                }}
                className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
              >
                Done
              </button>
            </div>

            {/* Picker Content */}
            <div className="p-6">
              <div className="flex justify-center space-x-6">
                {/* Date Picker */}
                <div className="flex space-x-4">
                                     {/* Month */}
                   <div className="w-20">
                     <div className="text-center text-gray-400 text-sm mb-3 font-medium">Month</div>
                     <div className="h-36 overflow-y-auto scrollbar-hide bg-gray-700/20 rounded-lg p-1">
                      {months.map((month, index) => (
                        <div
                          key={index}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            updateDate('month', index);
                          }}
                          className={`px-2 py-1 text-center cursor-pointer transition-all ${
                            selectedDate.getMonth() === index
                              ? 'bg-amber-400 text-gray-900 font-semibold rounded'
                              : 'text-white hover:bg-gray-700 rounded'
                          }`}
                        >
                          {month.slice(0, 3)}
                        </div>
                      ))}
                    </div>
                  </div>

                                     {/* Day */}
                   <div className="w-12">
                     <div className="text-center text-gray-400 text-sm mb-3 font-medium">Day</div>
                     <div className="h-36 overflow-y-auto scrollbar-hide bg-gray-700/20 rounded-lg p-1">
                      {days.map((day) => (
                                                <div
                          key={day}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            updateDate('day', day);
                          }}
                          className={`px-2 py-1 text-center cursor-pointer transition-all ${
                            selectedDate.getDate() === day
                              ? 'bg-amber-400 text-gray-900 font-semibold rounded'
                              : 'text-white hover:bg-gray-700 rounded'
                          }`}
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Year */}
                  <div className="w-16">
                    <div className="text-center text-gray-400 text-sm mb-3 font-medium">Year</div>
                    <div className="h-36 overflow-y-auto scrollbar-hide bg-gray-700/20 rounded-lg p-1">
                      {years.map((year) => (
                        <div
                          key={year}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            updateDate('year', year);
                          }}
                          className={`px-2 py-1 text-center cursor-pointer transition-all ${
                            selectedDate.getFullYear() === year
                              ? 'bg-amber-400 text-gray-900 font-semibold rounded'
                              : 'text-white hover:bg-gray-700 rounded'
                          }`}
                        >
                          {year}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Time Picker */}
                <div className="flex space-x-4">
                  {/* Hour */}
                  <div className="w-12">
                    <div className="text-center text-gray-400 text-sm mb-3 font-medium">Hour</div>
                    <div className="h-36 overflow-y-auto scrollbar-hide bg-gray-700/20 rounded-lg p-1">
                      {hours.map((hour) => (
                        <div
                          key={hour}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            updateDate('hour', hour);
                          }}
                          className={`px-2 py-1 text-center cursor-pointer transition-all ${
                            selectedDate.getHours() === hour
                              ? 'bg-amber-400 text-gray-900 font-semibold rounded'
                              : 'text-white hover:bg-gray-700 rounded'
                          }`}
                        >
                          {hour.toString().padStart(2, '0')}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Minute */}
                  <div className="w-12">
                    <div className="text-center text-gray-400 text-sm mb-3 font-medium">Min</div>
                    <div className="h-36 overflow-y-auto scrollbar-hide bg-gray-700/20 rounded-lg p-1">
                      {minutes.map((minute) => (
                        <div
                          key={minute}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            updateDate('minute', minute);
                          }}
                          className={`px-2 py-1 text-center cursor-pointer transition-all ${
                            selectedDate.getMinutes() === minute
                              ? 'bg-amber-400 text-gray-900 font-semibold rounded'
                              : 'text-white hover:bg-gray-700 rounded'
                          }`}
                        >
                          {minute.toString().padStart(2, '0')}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

// Custom CSS for datetime inputs to match our theme
const customDateTimeStyles = `
  input[type="datetime-local"]::-webkit-calendar-picker-indicator {
    filter: invert(1) brightness(0.8) sepia(100%) saturate(1000%) hue-rotate(30deg);
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  input[type="datetime-local"]::-webkit-calendar-picker-indicator:hover {
    filter: invert(1) brightness(1) sepia(100%) saturate(1000%) hue-rotate(30deg);
    transform: scale(1.1);
  }
  
  input[type="datetime-local"]::-webkit-datetime-edit {
    color: white;
    font-weight: 600;
  }
  
  input[type="datetime-local"]::-webkit-datetime-edit-fields-wrapper {
    color: white;
  }
  
  input[type="datetime-local"]::-webkit-datetime-edit-text {
    color: #fbbf24;
    font-weight: 700;
  }
  
  input[type="datetime-local"]::-webkit-datetime-edit-month-field,
  input[type="datetime-local"]::-webkit-datetime-edit-day-field,
  input[type="datetime-local"]::-webkit-datetime-edit-year-field,
  input[type="datetime-local"]::-webkit-datetime-edit-hour-field,
  input[type="datetime-local"]::-webkit-datetime-edit-minute-field {
    color: white;
    font-weight: 600;
  }
  
  input[type="datetime-local"]::-webkit-datetime-edit-month-field:focus,
  input[type="datetime-local"]::-webkit-datetime-edit-day-field:focus,
  input[type="datetime-local"]::-webkit-datetime-edit-year-field:focus,
  input[type="datetime-local"]::-webkit-datetime-edit-hour-field:focus,
  input[type="datetime-local"]::-webkit-datetime-edit-minute-field:focus {
    color: #fbbf24;
    background: rgba(251, 191, 36, 0.1);
    border-radius: 4px;
    outline: none;
  }
  
  /* Firefox styles */
  input[type="datetime-local"]::-moz-calendar-picker-indicator {
    filter: invert(1) brightness(0.8) sepia(100%) saturate(1000%) hue-rotate(30deg);
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  input[type="datetime-local"]::-moz-calendar-picker-indicator:hover {
    filter: invert(1) brightness(1) sepia(100%) saturate(1000%) hue-rotate(30deg);
    transform: scale(1.1);
  }
  
  /* Calendar dropdown styling */
  input[type="datetime-local"]::-webkit-calendar-picker-indicator:active {
    transform: scale(0.95);
  }
  
  /* Mobile calendar positioning fixes */
  @media (max-width: 768px) {
    input[type="datetime-local"] {
      position: relative;
      z-index: 1000;
    }
    
    /* Ensure calendar dropdown stays within viewport */
    input[type="datetime-local"]::-webkit-calendar-picker-indicator {
      position: relative;
      z-index: 1001;
    }
    
    /* Force calendar to open in a better position on mobile */
    input[type="datetime-local"]:focus {
      position: relative;
      z-index: 1002;
    }
  }
  
  /* Additional mobile optimizations */
  @media (max-width: 480px) {
    input[type="datetime-local"] {
      font-size: 16px; /* Prevents zoom on iOS */
      min-height: 44px; /* Better touch target */
    }
  }
  
  /* Hide scrollbar for webkit browsers */
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;  /* Chrome, Safari and Opera */
  }
  

`;

const SubEventForm = ({ megaEventId, parentLocation, parentRsvpDeadline, parentStartTime, parentEndTime, onCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [paymentEnabled, setPaymentEnabled] = useState(false);
  const [maxAttendees, setMaxAttendees] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [teamSizeMin, setTeamSizeMin] = useState('');
  const [teamSizeMax, setTeamSizeMax] = useState('');
  const [flexibleTeamSize, setFlexibleTeamSize] = useState(false);
  const [isTeamEvent, setIsTeamEvent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customFields, setCustomFields] = useState([]);
  const [qrImage, setQrImage] = useState(null);
  const [qrPreview, setQrPreview] = useState(null);
  const [tempEventId, setTempEventId] = useState(null);
  const [paymentProofRequired, setPaymentProofRequired] = useState(false);
  const [whatsappGroupEnabled, setWhatsappGroupEnabled] = useState(false);
  const [whatsappGroupLink, setWhatsappGroupLink] = useState('');
  const [showTimingWarning, setShowTimingWarning] = useState(false);
  const [timingWarningMessage, setTimingWarningMessage] = useState('');

  // Inject custom datetime styles
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = customDateTimeStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);



  // Timing validation function
  const validateTiming = (subStart, subEnd) => {
    if (!parentStartTime || !parentEndTime || !subStart || !subEnd) {
      return { isValid: true, message: '' };
    }

    const parentStart = new Date(parentStartTime);
    const parentEnd = new Date(parentEndTime);
    const subStartDate = new Date(subStart);
    const subEndDate = new Date(subEnd);

    // First check: Sub-event timing logic (start before end, minimum duration)
    if (subStartDate >= subEndDate) {
      return {
        isValid: false,
        message: 'Sub-event start time must be before end time and have a minimum duration.'
      };
    }

    // Check minimum duration (at least 15 minutes)
    const durationMs = subEndDate.getTime() - subStartDate.getTime();
    const minDurationMs = 15 * 60 * 1000; // 15 minutes in milliseconds
    if (durationMs < minDurationMs) {
      return {
        isValid: false,
        message: 'Sub-event must have a minimum duration of 15 minutes.'
      };
    }

    // Second check: Mega event timing constraints
    if (subStartDate < parentStart) {
      return {
        isValid: false,
        message: `Sub-event cannot start before the mega event. Mega event starts on ${parentStart.toLocaleDateString()} at ${parentStart.toLocaleTimeString()}.`
      };
    }

    // Check if sub-event ends after mega event
    if (subEndDate > parentEnd) {
      return {
        isValid: false,
        message: `Sub-event cannot end after the mega event. Mega event ends on ${parentEnd.toLocaleDateString()} at ${parentEnd.toLocaleTimeString()}.`
      };
    }

    return { isValid: true, message: '' };
  };

  // Handle timing changes with validation
  const handleStartTimeChange = (e) => {
    const newStartTime = e.target ? e.target.value : e;
    setStartTime(newStartTime);
    
    if (newStartTime && endTime) {
      const validation = validateTiming(newStartTime, endTime);
      if (!validation.isValid) {
        setTimingWarningMessage(validation.message);
        setShowTimingWarning(true);
      } else {
        setShowTimingWarning(false);
      }
    }
  };

  const handleEndTimeChange = (e) => {
    const newEndTime = e.target ? e.target.value : e;
    setEndTime(newEndTime);
    
    if (startTime && newEndTime) {
      const validation = validateTiming(startTime, newEndTime);
      if (!validation.isValid) {
        setTimingWarningMessage(validation.message);
        setShowTimingWarning(true);
      } else {
        setShowTimingWarning(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation before submission
    if (startTime && endTime) {
      const validation = validateTiming(startTime, endTime);
      if (!validation.isValid) {
        setTimingWarningMessage(validation.message);
        setShowTimingWarning(true);
        return;
      }
    }

    setLoading(true);
    setError('');
    setShowTimingWarning(false);
    
    // Validate QR code upload for paid events
    if (paymentEnabled && !qrPreview) {
      setError('Please upload a QR code for payment collection.');
      setLoading(false);
      return;
    }
    
    // Validate WhatsApp group link if enabled
    if (whatsappGroupEnabled && (!whatsappGroupLink || whatsappGroupLink.trim() === '')) {
      setError('Please provide a WhatsApp group link.');
      setLoading(false);
      return;
    }
    
    // Validate WhatsApp group link format
    if (whatsappGroupEnabled && whatsappGroupLink && !whatsappGroupLink.includes('chat.whatsapp.com')) {
      setError('Please provide a valid WhatsApp group link (should contain chat.whatsapp.com).');
      setLoading(false);
      return;
    }
    
    // Convert local datetime-local values to UTC ISO strings before sending
    const toISOString = (local) => local ? new Date(local).toISOString() : '';
    try {
      const eventResponse = await api.post(`/events/${megaEventId}/sub`, {
        title,
        description,
        location: parentLocation,
        startTime: toISOString(startTime),
        endTime: toISOString(endTime),
        rsvpDeadline: toISOString(parentRsvpDeadline),
        maxAttendees,
        teamSize: isTeamEvent ? (teamSize || null) : null,
        teamSizeMin: flexibleTeamSize ? teamSizeMin : null,
        teamSizeMax: flexibleTeamSize ? teamSizeMax : null,
        flexibleTeamSize,
        paymentEnabled,
        customFields,
        qrCode: qrPreview, // Use the Cloudinary URL directly
        paymentProofRequired,
        whatsappGroupEnabled,
        whatsappGroupLink: whatsappGroupEnabled ? whatsappGroupLink : null,
      });

      // If we have a QR code and the event was created successfully, associate it
      if (qrPreview && eventResponse.data.id && tempEventId) {
        try {
          console.log('Associating QR code:', {
            tempEventId,
            realEventId: eventResponse.data.id,
            qrCodeUrl: qrPreview
          });
          const associateResponse = await api.post('/associate-qr-code', {
            tempEventId: tempEventId,
            realEventId: eventResponse.data.id,
            qrCodeUrl: qrPreview
          });
          console.log('QR code association successful:', associateResponse.data);
        } catch (associateError) {
          console.error('Failed to associate QR code:', associateError);
          console.error('Association error details:', {
            message: associateError.message,
            status: associateError.response?.status,
            data: associateError.response?.data
          });
          // Don't fail the entire operation if QR association fails
        }
      }
      setTitle('');
      setDescription('');
      setStartTime('');
      setEndTime('');
      setMaxAttendees('');
      setTeamSize('');
      setTeamSizeMin('');
      setTeamSizeMax('');
      setFlexibleTeamSize(false);
      setIsTeamEvent(false);
      setPaymentEnabled(false);
      setCustomFields([]);
      setQrImage(null);
      setQrPreview(null);
      setPaymentProofRequired(false);
      setWhatsappGroupEnabled(false);
      setWhatsappGroupLink('');
      
      // Show success notification
      setTimeout(() => {
        const successElement = document.createElement('div');
        successElement.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
        successElement.innerHTML = '🎉 Sub-event created successfully!';
        document.body.appendChild(successElement);
        
        // Animate in
        setTimeout(() => {
          successElement.style.transform = 'translateX(0)';
        }, 100);
        
        // Animate out and remove
        setTimeout(() => {
          successElement.style.transform = 'translateX(full)';
          setTimeout(() => {
            document.body.removeChild(successElement);
          }, 300);
        }, 3000);
      }, 100);
      
      if (onCreated) onCreated();
    } catch (err) {
      console.error('Sub-event creation error:', err);
      console.error('Creation error details:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      
      let errorMessage = 'Failed to create sub-event. Please try again.';
      
      if (err.response?.status === 400) {
        errorMessage = err.response.data.error || 'Invalid sub-event data. Please check your information.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Mega event not found. Please check the event link.';
      } else if (err.response?.status === 409) {
        errorMessage = 'A sub-event with this title already exists. Please choose a different title.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else {
        errorMessage = err.response?.data?.error || err.message || 'Failed to create sub-event. Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic custom field builder UI
  const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'email', label: 'Email' },
    { value: 'textarea', label: 'Textarea' },
    { value: 'whatsapp', label: 'WhatsApp Number' },
    { value: 'usn', label: 'USN' },
    { value: 'dropdown', label: 'Dropdown' },
    { value: 'number', label: 'Number' },
  ];

  const [dropdownOpenStates, setDropdownOpenStates] = useState([]);

  // Check if all fields are complete
  const areAllFieldsComplete = () => {
    return customFields.every(field => {
      const hasLabel = field.label.trim() !== '';
      const hasType = field.type !== '';
      const hasOptions = field.type !== 'dropdown' || (field.options && field.options.length > 0);
      return hasLabel && hasType && hasOptions;
    });
  };

  const addField = () => {
    // Only allow adding if all current fields are complete
    if (!areAllFieldsComplete()) {
      setError('Please complete all current fields before adding new ones.');
      return;
    }
    
    setCustomFields([...customFields, { label: '', type: 'text', required: false, options: [], isIndividual: false }]);
    setDropdownOpenStates([...dropdownOpenStates, false]);
    setError(''); // Clear any previous errors
  };

  const updateField = (idx, key, value) => {
    const updated = [...customFields];
    updated[idx][key] = value;
    setCustomFields(updated);
  };

  const removeField = (idx) => {
    setCustomFields(customFields.filter((_, i) => i !== idx));
    setDropdownOpenStates(dropdownOpenStates.filter((_, i) => i !== idx));
  };

  const handleQrChange = (e) => {
    const file = e.target.files[0];
    setQrImage(file);
    setQrPreview(file ? URL.createObjectURL(file) : null);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-6xl mx-auto bg-gray-900 md:bg-white/5 md:backdrop-blur-md border border-gray-700 md:border-white/10 shadow-none md:shadow-lg rounded-2xl p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Sub-Event Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-gray-800 md:bg-[#302b63] text-white font-semibold border-2 border-amber-400/30 shadow-none md:shadow focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400/60 hover:bg-gray-700 md:hover:bg-[#3a3470] hover:border-amber-400/50 transition duration-200"
              required
              aria-label="Sub-Event Title"
            />
            <input
              type="number"
              min="1"
              placeholder="Max Attendees"
              value={maxAttendees}
              onChange={e => setMaxAttendees(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-gray-800 md:bg-[#302b63] text-white font-semibold border-2 border-amber-400/30 shadow-none md:shadow focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400/60 hover:bg-gray-700 md:hover:bg-[#3a3470] hover:border-amber-400/50 transition duration-200"
              required
              aria-label="Max Attendees"
            />
          </div>
          <textarea
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-gray-800 md:bg-[#302b63] text-white font-semibold border-2 border-amber-400/30 shadow-none md:shadow focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400/60 hover:bg-gray-700 md:hover:bg-[#3a3470] hover:border-amber-400/50 transition duration-200 min-h-[80px]"
            required
            aria-label="Description"
          />
          {/* Mega Event Timing Constraints Info */}
          {parentStartTime && parentEndTime && (
            <div className="px-4 py-3 bg-blue-400/10 border border-blue-400/20 rounded-xl">
              <h4 className="text-blue-300 font-bold mb-2 flex items-center gap-2">
                <span className="text-lg">⏰</span>
                Mega Event Timing Constraints
              </h4>
              <div className="text-sm text-white/80 space-y-1">
                <p><span className="text-blue-300 font-semibold">Mega Event:</span> {new Date(parentStartTime).toLocaleDateString()} {new Date(parentStartTime).toLocaleTimeString()} - {new Date(parentEndTime).toLocaleDateString()} {new Date(parentEndTime).toLocaleTimeString()}</p>
                <p className="text-blue-200 text-xs">⚠️ Sub-event must be scheduled within this time range</p>
              </div>
            </div>
          )}

          <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-4 gap-2 w-full">
            {/* Mobile Date Time Picker */}
            <div className="md:hidden">
              <MobileDateTimePicker
                value={startTime}
                onChange={handleStartTimeChange}
                label="Start Time"
                minDate={parentStartTime ? new Date(parentStartTime) : null}
                maxDate={parentEndTime ? new Date(parentEndTime) : null}
              />
            </div>
            
            {/* Desktop Date Time Input */}
            <div className="hidden md:block relative">
              <input
                type="datetime-local"
                value={startTime}
                onChange={handleStartTimeChange}
                className="w-full min-w-0 px-4 py-3 rounded-2xl bg-[#302b63] text-white font-semibold border-2 border-amber-400/30 shadow focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400/60 hover:bg-[#3a3470] hover:border-amber-400/50 transition duration-200"
                required
                aria-label="Start Time"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-400/5 to-orange-400/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>

            {/* Mobile Date Time Picker */}
            <div className="md:hidden">
              <MobileDateTimePicker
                value={endTime}
                onChange={handleEndTimeChange}
                label="End Time"
                minDate={parentStartTime ? new Date(parentStartTime) : null}
                maxDate={parentEndTime ? new Date(parentEndTime) : null}
              />
            </div>
            
            {/* Desktop Date Time Input */}
            <div className="hidden md:block relative">
              <input
                type="datetime-local"
                value={endTime}
                onChange={handleEndTimeChange}
                className="w-full min-w-0 px-4 py-3 rounded-2xl bg-[#302b63] text-white font-semibold border-2 border-amber-400/30 shadow focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400/60 hover:bg-[#3a3470] hover:border-amber-400/50 transition duration-200"
                required
                aria-label="End Time"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-400/5 to-orange-400/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          </div>
          {showTimingWarning && (
            <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl p-3 text-amber-300 text-sm font-medium">
              <p>{timingWarningMessage}</p>
            </div>
          )}

          {/* Timing Warning Popup - Rendered via Portal */}
          {showTimingWarning && createPortal(
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]"
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9999
              }}
            >
              <div 
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 shadow-2xl p-6 w-full max-w-md mx-4 text-center"
                style={{
                  position: 'relative',
                  zIndex: 10000,
                  maxHeight: '80vh',
                  overflowY: 'auto'
                }}
              >
                <div className="mb-4 flex justify-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                <div className="mb-4 text-lg font-semibold text-white">Timing Constraint Warning</div>
                <div className="mb-6 text-gray-300 text-sm leading-relaxed">{timingWarningMessage}</div>
                <div className="flex justify-center gap-3">
                  <Button 
                    onClick={() => {
                      setShowTimingWarning(false);
                      setStartTime('');
                      setEndTime('');
                      setTimingWarningMessage('');
                    }} 
                    className="bg-gradient-to-r from-amber-500 to-orange-500 shadow hover:shadow-md"
                  >
                    I Understand
                  </Button>
                </div>
              </div>
            </div>,
            document.body
          )}
          {/* Team Size Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isTeamEvent}
                onChange={e => {
                  if (!e.target.checked) {
                    setIsTeamEvent(false);
                    setTeamSize('');
                    setTeamSizeMin('');
                    setTeamSizeMax('');
                    setFlexibleTeamSize(false);
                  } else {
                    setIsTeamEvent(true);
                    setTeamSize('4');
                    setTeamSizeMin('2');
                    setTeamSizeMax('4');
                  }
                }}
                id="teamEvent"
                className="peer appearance-none h-6 w-6 border-2 border-amber-400 rounded-xl bg-[#302b63] checked:bg-amber-400 checked:border-amber-400 transition duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400/60 relative"
                aria-checked={isTeamEvent}
              />
              <label htmlFor="teamEvent" className="text-white font-semibold cursor-pointer select-none">Team Event</label>
            </div>

            {isTeamEvent && (
              <div className="space-y-4 p-4 md:p-3 md:space-y-3 bg-amber-400/5 border-2 border-amber-400/30 rounded-xl">
                {/* Flexible Team Size Toggle */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={flexibleTeamSize}
                    onChange={e => setFlexibleTeamSize(e.target.checked)}
                    id="flexibleTeamSize"
                    className="peer appearance-none h-5 w-5 border-2 border-blue-400 rounded-lg bg-[#302b63] checked:bg-blue-400 checked:border-blue-400 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-400/60 relative"
                  />
                  <label htmlFor="flexibleTeamSize" className="text-blue-300 font-medium cursor-pointer select-none text-sm">
                    Allow flexible team sizes
                  </label>
                </div>

                {flexibleTeamSize ? (
                  /* Flexible Team Size Range */
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Minimum Team Size</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        placeholder="Min"
                        value={teamSizeMin}
                        onChange={e => setTeamSizeMin(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-gray-800 md:bg-[#302b63] text-white font-semibold border-2 border-amber-400/30 shadow-none md:shadow focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400/60 hover:bg-gray-700 md:hover:bg-[#3a3470] hover:border-amber-400/50 transition duration-200"
                        aria-label="Minimum Team Size"
                        required={isTeamEvent && flexibleTeamSize}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Maximum Team Size</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        placeholder="Max"
                        value={teamSizeMax}
                        onChange={e => setTeamSizeMax(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-gray-800 md:bg-[#302b63] text-white font-semibold border-2 border-amber-400/30 shadow-none md:shadow focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400/60 hover:bg-gray-700 md:hover:bg-[#3a3470] hover:border-amber-400/50 transition duration-200"
                        aria-label="Maximum Team Size"
                        required={isTeamEvent && flexibleTeamSize}
                      />
                    </div>
                  </div>
                ) : (
                  /* Fixed Team Size */
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 md:mb-1">Fixed Team Size</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      placeholder="Team Size"
                      value={teamSize}
                      onChange={e => setTeamSize(e.target.value)}
                      className="w-full px-3 py-2 md:py-1.5 rounded-lg bg-gray-800 md:bg-[#302b63] text-white font-semibold border-2 border-amber-400/30 shadow-none md:shadow focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400/60 hover:bg-gray-700 md:hover:bg-[#3a3470] hover:border-amber-400/50 transition duration-200"
                      aria-label="Team Size"
                      required={isTeamEvent && !flexibleTeamSize}
                    />
                  </div>
                )}

                {/* Team Size Summary */}
                <div className="px-3 py-2 md:py-1.5 bg-gradient-to-r from-amber-400/10 to-blue-400/10 border-2 border-amber-400/30 rounded-lg">
                  {flexibleTeamSize ? (
                    <p className="text-amber-300 text-sm font-medium">
                      🏆 Flexible Team Event: Teams can have {teamSizeMin || '2'} to {teamSizeMax || '4'} participants
                    </p>
                  ) : (
                    <p className="text-amber-300 text-sm font-medium">
                      🏆 Fixed Team Event: Teams must have exactly {teamSize} participant{parseInt(teamSize) > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            )}

            {!isTeamEvent && (
              <div className="px-4 py-2 bg-green-400/10 border border-green-400/20 rounded-xl">
                <p className="text-green-300 text-sm font-medium">
                  👤 Solo Event: Individual participation only
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={paymentEnabled}
              onChange={e => setPaymentEnabled(e.target.checked)}
              id="paid"
              className="peer appearance-none h-6 w-6 border-2 border-amber-400 rounded-xl bg-[#302b63] checked:bg-amber-400 checked:border-amber-400 transition duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400/60 relative"
              aria-checked={paymentEnabled}
            />
            <label htmlFor="paid" className="text-white font-semibold cursor-pointer select-none">Paid Sub-Event</label>
          </div>
          {paymentEnabled && (
            <div className="flex flex-col gap-4 mt-2 bg-gray-800 md:bg-[#302b63] rounded-2xl p-4 border-2 border-amber-400/30 shadow-none md:shadow">
              <div className="bg-gray-700 md:bg-[#3a3470] rounded-xl p-4">
                <QRCodeUpload
                  eventId={null} // Will be set after event creation
                  onUploadSuccess={(data) => {
                    setQrImage(data.qrCode);
                    setQrPreview(data.qrCode);
                    if (data.tempEventId) {
                      setTempEventId(data.tempEventId);
                    }
                  }}
                  onUploadError={(error) => {
                    console.error('QR code upload failed:', error);
                  }}
                  existingQRCode={qrPreview}
                  onDelete={() => {
                    setQrImage(null);
                    setQrPreview(null);
                    setTempEventId(null);
                  }}
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={paymentProofRequired}
                  onChange={e => setPaymentProofRequired(e.target.checked)}
                  id="paymentProofRequired"
                  className="peer appearance-none h-6 w-6 border-2 border-amber-400 rounded-xl bg-[#302b63] checked:bg-amber-400 checked:border-amber-400 transition duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400/60 relative"
                  aria-checked={paymentProofRequired}
                />
                <label htmlFor="paymentProofRequired" className="text-white font-semibold cursor-pointer select-none">Require payment screenshot upload in registration form</label>
              </div>
            </div>
          )}
          
          {/* WhatsApp Group Section */}
          <div className="flex items-center gap-3 mt-4">
            <input
              type="checkbox"
              checked={whatsappGroupEnabled}
              onChange={e => setWhatsappGroupEnabled(e.target.checked)}
              id="whatsappGroup"
              className="peer appearance-none h-6 w-6 border-2 border-green-400 rounded-xl bg-[#302b63] checked:bg-green-400 checked:border-green-400 transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-400/60 focus:border-green-400/60 relative"
              aria-checked={whatsappGroupEnabled}
            />
            <label htmlFor="whatsappGroup" className="text-white font-semibold cursor-pointer select-none flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
              WhatsApp Group for Event
            </label>
          </div>
          {whatsappGroupEnabled && (
            <div className="flex flex-col gap-3 mt-3 bg-gray-800 md:bg-[#302b63] rounded-2xl p-4 border-2 border-green-400/30 shadow-none md:shadow">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-green-400/20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                </div>
                <div>
                  <label className="text-white font-semibold text-sm">WhatsApp Group Link</label>
                  <p className="text-green-300 text-xs">Participants will receive this link after registration</p>
                </div>
              </div>
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://chat.whatsapp.com/..."
                  value={whatsappGroupLink}
                  onChange={e => setWhatsappGroupLink(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 md:bg-[#3a3470] text-white font-medium border-2 border-green-400/30 focus:outline-none focus:ring-2 focus:ring-green-400/60 focus:border-green-400/60 hover:bg-gray-600 md:hover:bg-[#443d7a] transition-all duration-200"
                  required={whatsappGroupEnabled}
                  aria-label="WhatsApp Group Link"
                />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-green-400/5 to-emerald-400/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-400/10 border border-green-400/20 rounded-lg">
                <div className="w-5 h-5 bg-green-400/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-xs text-green-200">
                  <p className="font-medium mb-1">💡 How it works:</p>
                  <ul className="space-y-1 text-green-100/80">
                    <li>• Participants get the WhatsApp link after successful registration</li>
                    <li>• Perfect for event updates, announcements, and networking</li>
                    <li>• Helps build community and improve event engagement</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="bg-gray-800 md:bg-[#302b63] rounded-2xl p-4 md:p-6 border-2 border-amber-400/30 shadow-none md:shadow-lg mt-6 md:mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">Custom Registration Fields</h3>
        </div>
        
        {/* Info Section for Team Events */}
        {isTeamEvent && (
          <div className="mb-6 p-4 bg-gray-700 md:bg-gradient-to-r md:from-amber-400/10 md:to-blue-400/10 border-2 border-amber-400/30 rounded-xl">
            <h4 className="text-amber-300 font-bold mb-2 flex items-center gap-2">
              <span className="text-lg">ℹ️</span>
              Team Event Field Types
            </h4>
            <div className="text-sm text-white/80 space-y-2">
              <div className="flex items-start gap-3">
                <span className="text-green-300 font-semibold">🏆 Team Fields:</span>
                <span>Filled once for the entire team (e.g., College, Degree, Team Name)</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-300 font-semibold">👤 Individual Fields:</span>
                <span>Filled once for each team member (e.g., Name, Email, Phone)</span>
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {customFields.length === 0 && <div className="text-gray-400">No custom fields added yet.</div>}
          
          {/* Preview Section */}
          {isTeamEvent && customFields.length > 0 && (
            <div className="mb-6 p-4 bg-gray-700 md:bg-gradient-to-r md:from-blue-400/10 md:to-green-400/10 border-2 border-amber-400/30 rounded-xl">
              <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                <span className="text-lg">👁️</span>
                Registration Form Preview
              </h4>
              <div className="space-y-2 text-sm">
                {customFields.map((field, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      field.isIndividual 
                        ? 'bg-blue-400/20 text-blue-300 border border-blue-400/30' 
                        : 'bg-green-400/20 text-green-300 border border-green-400/30'
                    }`}>
                      {field.isIndividual ? '👤 Individual' : '🏆 Team'}
                    </span>
                    <span className="text-white/80">{field.label}</span>
                    <span className="text-white/60">
                      {field.isIndividual 
                        ? `→ ${teamSize} separate inputs` 
                        : '→ 1 input for team'
                      }
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-gray-600 md:bg-white/5 rounded-lg border border-gray-500 md:border-white/10">
                <h5 className="text-white font-semibold mb-2 text-sm">💡 Examples:</h5>
                <div className="text-xs text-white/70 space-y-1">
                  <div><span className="text-green-300">🏆 Team Fields:</span> College, Degree, Team Name, Project Title</div>
                  <div><span className="text-blue-300">👤 Individual Fields:</span> Name, Email, Phone, USN</div>
                </div>
              </div>
            </div>
          )}
          {customFields.map((field, idx) => {
            const selectedType = fieldTypes.find(ft => ft.value === field.type);
            const isFieldComplete = field.label.trim() !== '' && field.type !== '' && 
              (field.type !== 'dropdown' || (field.options && field.options.length > 0));
            
            return (
              <div key={idx} className={`relative bg-gray-700 md:bg-white/10 rounded-xl p-4 border-2 shadow-none md:shadow transition-all duration-200 ${
                isFieldComplete 
                  ? 'border-amber-400/30' 
                  : 'border-amber-400/50 bg-amber-400/5'
              }`}>
                {/* Delete Button - Floating in top-right corner */}
                <button
                  type="button"
                  onClick={() => removeField(idx)}
                  className="absolute top-2 right-2 z-10 flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white/90 transition duration-200 rounded-full p-2 shadow-md focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:ring-offset-1"
                  aria-label="Remove Field"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V6a3 3 0 013-3v0a3 3 0 013 3v1m-7 0h10m-1 2v10a2 2 0 01-2 2H9a2 2 0 01-2-2V9m10 0H6" />
                  </svg>
                </button>

                {/* Field Status Indicator - Mobile: top-left, Desktop: bottom-left with Required indicator */}
                {!isFieldComplete && (
                  <>
                    {/* Mobile Badge - Original absolute positioning */}
                    <div className="absolute top-2 left-2 z-10 md:hidden">
                      <div className="flex items-center gap-1 px-2 py-1 bg-amber-400/20 border border-amber-400/30 rounded-full">
                        <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                        <span className="text-amber-300 text-xs font-medium">Incomplete</span>
                      </div>
                    </div>
                    {/* Desktop Badge - Top Left Corner */}
                    <div className="absolute top-2 left-2 z-10 hidden md:flex items-center gap-3 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                      <div className="flex items-center gap-1 px-2 py-1 bg-amber-400/20 border border-amber-400/30 rounded-full">
                        <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                        <span className="text-amber-300 text-xs font-medium">Incomplete</span>
                      </div>
                    </div>
                  </>
                )}
                
                {/* Desktop Required Checkbox - Top Right Corner */}
                <div className="absolute top-2 right-12 z-10 hidden md:flex items-center gap-2 bg-white/5 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/10">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={e => updateField(idx, 'required', e.target.checked)}
                    id={`required-desktop-${idx}`}
                    className="peer appearance-none h-4 w-4 border-2 border-amber-400 rounded-md bg-[#302b63] checked:bg-amber-400 checked:border-amber-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400/60 relative"
                    aria-checked={field.required}
                  />
                  <span className="absolute pointer-events-none left-0.5 top-0.5 w-3 h-3 flex items-center justify-center">
                    <svg className="hidden peer-checked:block w-3 h-3 text-amber-900" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  </span>
                  <label htmlFor={`required-desktop-${idx}`} className="text-amber-300 text-xs font-medium cursor-pointer select-none">Required</label>
                </div>

                {/* Field Configuration Content */}
                <div className="space-y-4 md:space-y-6 pr-2 md:pr-12"> {/* Reduced mobile padding and spacing */}
                  
                  {/* Row 1: Field Label and Type - Improved Desktop Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Field Label - Desktop optimized */}
                    <div className="pt-4 md:pt-8">
                      <label className="block text-white font-semibold mb-2 md:mb-3 text-sm tracking-wide">Field Label</label>
                      <input
                        type="text"
                        placeholder="Enter field label..."
                        value={field.label}
                        onChange={e => updateField(idx, 'label', e.target.value)}
                        className={`w-full px-4 py-3 rounded-lg bg-gray-800 md:bg-[#302b63] text-white font-medium border-2 focus:outline-none focus:ring-2 hover:bg-gray-700 md:hover:bg-[#3a3470] transition-all duration-200 ${
                          field.label.trim() === '' 
                            ? 'border-amber-400/50 focus:ring-amber-400/60 focus:border-amber-400/60' 
                            : 'border-amber-400/30 focus:ring-amber-400/60 focus:border-amber-400/60'
                        }`}
                        required
                        aria-label={`Field Label ${idx+1}`}
                      />
                    </div>
                    
                    {/* Field Type - Desktop optimized */}
                    <div className="relative pt-4 md:pt-8">
                      <label className="block text-white font-semibold mb-2 md:mb-3 text-sm tracking-wide">Field Type</label>
                      <button
                        type="button"
                        onClick={() => {
                          const newStates = [...dropdownOpenStates];
                          newStates[idx] = !dropdownOpenStates[idx];
                          setDropdownOpenStates(newStates);
                        }}
                        className="w-full px-4 py-3 rounded-lg bg-gray-800 md:bg-[#302b63] text-white font-medium border-2 border-amber-400/30 shadow-none md:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400/60 hover:bg-gray-700 md:hover:bg-[#3a3470] hover:border-amber-400/50 flex items-center justify-between"
                        style={{ background: '#302b63', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)' }}
                        aria-haspopup="listbox"
                        aria-expanded={dropdownOpenStates[idx]}
                      >
                        <span className="truncate">{selectedType?.label || 'Select field type...'}</span>
                        <svg className={`w-5 h-5 text-amber-300 transition-transform duration-200 flex-shrink-0 ml-2 ${dropdownOpenStates[idx] ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24">
                          <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6"/>
                        </svg>
                      </button>
                      {dropdownOpenStates[idx] && (
                        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#302b63] backdrop-blur-2xl border-2 border-white/30 rounded-lg shadow-xl overflow-hidden" style={{ background: '#302b63', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)' }} role="listbox">
                          {fieldTypes.map(ft => (
                            <button
                              key={ft.value}
                              type="button"
                              onClick={() => { updateField(idx, 'type', ft.value); const newStates = [...dropdownOpenStates]; newStates[idx] = false; setDropdownOpenStates(newStates); }}
                              className={`w-full px-4 py-3 text-left text-white font-medium transition-all duration-200 hover:bg-[#3a3470] focus:outline-none focus:bg-[#3a3470] ${field.type === ft.value ? 'bg-amber-400/90 text-amber-900' : ''}`}
                              style={{ backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)' }}
                              role="option"
                              aria-selected={field.type === ft.value}
                            >
                              {ft.label}
                            </button>
                          ))}
                        </div>
                      )}
                      {dropdownOpenStates[idx] && (
                        <div className="fixed inset-0 z-40" onClick={() => { const newStates = [...dropdownOpenStates]; newStates[idx] = false; setDropdownOpenStates(newStates); }} tabIndex={-1} aria-hidden="true" />
                      )}
                    </div>
                  </div>

                  {/* Row 2: Required Checkbox (Mobile) and Field Type Toggle - Desktop Optimized */}
                  <div className={`grid gap-4 md:gap-6 ${teamSize ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                    {/* Mobile Required Checkbox - Untouched */}
                    <div className="md:hidden">
                      <label className="block text-white font-semibold mb-2 text-sm">Field Settings</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={e => updateField(idx, 'required', e.target.checked)}
                          id={`required-${idx}`}
                          className="peer appearance-none h-6 w-6 border-2 border-amber-400 rounded-xl bg-[#302b63] checked:bg-amber-400 checked:border-amber-400 transition duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400/60 relative"
                          aria-checked={field.required}
                        />
                        <span className="absolute pointer-events-none left-1 top-1 w-4 h-4 flex items-center justify-center">
                          <svg className="hidden peer-checked:block w-4 h-4 text-amber-900" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                        </span>
                        <label htmlFor={`required-${idx}`} className="text-white font-semibold cursor-pointer select-none text-sm">Required Field</label>
                      </div>
                    </div>

                    {/* Field Type Toggle - Desktop Optimized */}
                    {teamSize && (
                      <div className="md:col-span-2">
                        <label className="block text-white font-semibold mb-2 md:mb-3 text-sm tracking-wide">Field Type Configuration</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                          <button
                            type="button"
                            role="radio"
                            aria-checked={!field.isIndividual}
                            onClick={() => updateField(idx, 'isIndividual', false)}
                            className={`p-4 rounded-lg border-2 transition-all duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-400/60 hover:scale-[1.02] ${
                              !field.isIndividual
                                ? 'bg-green-500/20 border-green-400 text-green-300 shadow-lg'
                                : 'bg-white/10 border-white/20 text-white/60 hover:bg-white/20 hover:border-white/30'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">🏆</span>
                              <div className="text-left">
                                <div className="font-bold text-base">Team Field</div>
                                <div className="text-xs opacity-80 mt-1">Filled once for entire team</div>
                              </div>
                            </div>
                          </button>
                          <button
                            type="button"
                            role="radio"
                            aria-checked={field.isIndividual}
                            onClick={() => updateField(idx, 'isIndividual', true)}
                            className={`p-4 rounded-lg border-2 transition-all duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400/60 hover:scale-[1.02] ${
                              field.isIndividual
                                ? 'bg-blue-500/20 border-blue-400 text-blue-300 shadow-lg'
                                : 'bg-white/10 border-white/20 text-white/60 hover:bg-white/20 hover:border-white/30'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">👤</span>
                              <div className="text-left">
                                <div className="font-bold text-base">Individual Field</div>
                                <div className="text-xs opacity-80 mt-1">Filled once per participant</div>
                              </div>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Row 3: Dropdown Options (if applicable) - Desktop Optimized */}
                  {field.type === 'dropdown' && (
                    <div className="md:col-span-2">
                      <label className="block text-white font-semibold mb-2 md:mb-3 text-sm tracking-wide">Dropdown Options</label>
                      <input
                        type="text"
                        placeholder="Enter options separated by commas (e.g., Option 1, Option 2, Option 3)"
                        value={field.options?.join(',') || ''}
                        onChange={e => updateField(idx, 'options', e.target.value.split(','))}
                        className={`w-full px-4 py-3 rounded-lg bg-gray-800 md:bg-[#302b63] text-white font-medium border-2 focus:outline-none focus:ring-2 transition-all duration-200 ${
                          field.type === 'dropdown' && (!field.options || field.options.length === 0)
                            ? 'border-amber-400/50 focus:ring-amber-400/60 focus:border-amber-400/60' 
                            : 'border-amber-400/30 focus:ring-amber-400/60 focus:border-amber-400/60'
                        }`}
                        aria-label={`Dropdown Options ${idx+1}`}
                      />
                      <p className="text-xs text-gray-400 mt-2">💡 Separate multiple options with commas</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Floating Add Field Button */}
      <div className="relative mt-8">
        <div className="flex justify-center">
          <Button 
            type="button" 
            onClick={addField}
            disabled={!areAllFieldsComplete()}
            className={`px-8 py-4 rounded-2xl font-bold shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400/60 ${
              areAllFieldsComplete()
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed shadow-gray-600/25'
            }`}
          >
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-lg">Add Custom Field</span>
            </div>
          </Button>
        </div>
        
        {/* Helper text */}
        {!areAllFieldsComplete() && customFields.length > 0 && (
          <div className="mt-3 text-center">
            <p className="text-amber-300 text-sm font-medium">
              ⚠️ Complete all current fields to add more
            </p>
          </div>
        )}
        
        {customFields.length === 0 && (
          <div className="mt-3 text-center">
            <p className="text-blue-300 text-sm font-medium">
              💡 Start by adding your first custom field
            </p>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-red-400 text-lg">⚠️</div>
            <div className="flex-1">
              <p className="text-red-400 font-semibold mb-1">Creation Failed</p>
              <p className="text-red-300 text-sm">{error}</p>
              <div className="mt-2 text-xs text-red-200/80">
                💡 Please check your information and try again. If the problem persists, contact support.
              </div>
            </div>
          </div>
        </div>
      )}
      <Button type="submit" disabled={loading} className="w-full bg-amber-500 text-white px-6 py-3 rounded-2xl font-bold shadow transition duration-300 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400/60 mt-8">
        {loading ? 'Adding...' : 'Add Sub-Event'}
      </Button>
    </form>
  );
};

export default SubEventForm;
