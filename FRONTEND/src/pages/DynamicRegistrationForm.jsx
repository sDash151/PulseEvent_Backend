import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/ui/Button';
import BackButton from '../components/ui/BackButton';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Loading from '../components/ui/Loading';
import PageContainer from '../components/ui/PageContainer';
import { useAuth } from '../hooks/useAuth';

const DynamicRegistrationForm = () => {
  const { parentId, subId } = useParams();
  const [customFields, setCustomFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [participants, setParticipants] = useState([]);
  const [selectedTeamSize, setSelectedTeamSize] = useState(null);
  const [paymentProof, setPaymentProof] = useState(null);
  const [paymentPreview, setPaymentPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [tempWaitingListId, setTempWaitingListId] = useState(null);
  const [uploadedPaymentProofUrl, setUploadedPaymentProofUrl] = useState(null);
  const fileInputRef = useRef(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [showPaymentProofPopup, setShowPaymentProofPopup] = useState(false);

  useEffect(() => {
    async function fetchFields() {
      try {
        console.log('Fetching event data for subId:', subId);
        const eventRes = await api.get(`/events/${subId}`);
        console.log('Event data received:', eventRes.data);
        console.log('Custom fields from event:', eventRes.data.customFields);
        console.log('QR Code URL:', eventRes.data.qrCode);
        console.log('Payment enabled:', eventRes.data.paymentEnabled);
        setEvent(eventRes.data);
        setCustomFields(eventRes.data.customFields || []);
        console.log('Custom fields set:', eventRes.data.customFields || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching event data:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
        setError(error.response?.data?.error || error.message || 'Failed to load event data');
        setLoading(false);
      }
    }
    fetchFields();
  }, [subId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    setUploadError('');
    
    // Enhanced file validation
    if (!file) {
      setUploadError('Please select a file');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file (PNG, JPG, JPEG, GIF, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB');
      return;
    }

    if (file.size === 0) {
      setUploadError('File is empty. Please select a valid image file.');
      return;
    }

    // Create immediate preview for better UX
    const reader = new FileReader();
    reader.onload = (e) => {
      setPaymentPreview(e.target.result);
    };
    reader.onerror = () => {
      setUploadError('Failed to read file. Please try selecting a different image.');
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary immediately
    await uploadFile(file);
  };

  const uploadFile = async (file) => {
    setIsUploading(true);
    setUploadError('');

    try {
      // Upload payment proof to Cloudinary directly without creating waiting list entry
      const formData = new FormData();
      formData.append('paymentProof', file);

      console.log('Uploading payment proof...');
      const uploadRes = await api.post('/upload/payment-proof', formData);
      const paymentProofUrl = uploadRes.data.paymentProof;
      console.log('Payment proof upload successful:', paymentProofUrl);
      
      setUploadedPaymentProofUrl(paymentProofUrl);
      setPaymentProof(paymentProofUrl); // Keep for backward compatibility

      // Show a brief success popup (React state-driven, centered at bottom)
      setShowPaymentProofPopup(true);
      setTimeout(() => setShowPaymentProofPopup(false), 3000);
      
    } catch (err) {
      console.error('Payment proof upload error:', err);
      console.error('Upload error details:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: '/upload/payment-proof'
      });
      
      let errorMessage = 'Upload failed. Please try again.';
      
      if (err.response?.status === 400) {
        errorMessage = err.response.data.error || 'Invalid file. Please check the file format and size.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Upload service not found. Please contact support.';
      } else if (err.response?.status === 413) {
        errorMessage = 'File too large. Please select a file smaller than 5MB.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else {
        errorMessage = err.response?.data?.error || err.message || 'Upload failed. Please try again.';
      }
      
      setUploadError(errorMessage);
      setPaymentPreview(null);
    } finally {
      setIsUploading(false);
      setIsRetrying(false);
    }
  };

  const handleRemovePaymentProof = async () => {
    if (uploadedPaymentProofUrl) {
      try {
        console.log('Removing payment proof...');
        // Delete from Cloudinary (if we have the URL, we can extract the public_id)
        // For now, just clear the local state since we don't have the waiting list ID yet
        console.log('Payment proof removal successful');
      } catch (err) {
        console.error('Error cleaning up payment proof:', err);
        console.error('Cleanup error details:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data
        });
      }
    }
    
    setPaymentProof(null);
    setPaymentPreview(null);
    setUploadedPaymentProofUrl(null);
    setTempWaitingListId(null);
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    // Clear any previous errors when starting a new upload
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const retryUpload = () => {
    if (paymentPreview) {
      setUploadError('');
      setIsRetrying(true);
      // Re-upload the current preview
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'payment-proof.png', { type: 'image/png' });
            uploadFile(file);
          }
        }, 'image/png');
      };
      img.onerror = () => {
        setUploadError('Failed to process image for retry. Please select a new file.');
        setIsRetrying(false);
      };
      img.src = paymentPreview;
    }
  };

  const handleParticipantChange = (idx, field, value) => {
    const updated = [...participants];
    updated[idx] = { ...updated[idx], [field]: value };
    setParticipants(updated);
  };

  const addParticipant = () => {
    setParticipants([...participants, {}]);
  };

  const handleTeamSizeSelect = (size) => {
    setSelectedTeamSize(size);
    // Reset participants to match new team size
    setParticipants(Array.from({ length: size }, () => ({})));
  };

  // Get available team sizes for flexible team events
  const getAvailableTeamSizes = () => {
    if (!event?.flexibleTeamSize || !event?.teamSizeMin || !event?.teamSizeMax) {
      return [];
    }
    const sizes = [];
    for (let i = parseInt(event.teamSizeMin); i <= parseInt(event.teamSizeMax); i++) {
      sizes.push(i);
    }
    return sizes;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!event) {
      console.error('Event data not available');
      return;
    }

    // Validate team size selection for flexible team events
    if (event.flexibleTeamSize && !selectedTeamSize) {
      setPopupMessage('Please select a team size before submitting.');
      setShowErrorPopup(true);
      return;
    }

    // Validate that we have a valid event ID
    if (!subId || isNaN(Number(subId))) {
      setPopupMessage('Invalid event ID. Please try refreshing the page.');
      setShowErrorPopup(true);
      return;
    }

    // Debug: Log current form state
    console.log('Form submission debug:', {
      event,
      customFields,
      formData,
      participants,
      selectedTeamSize,
      uploadedPaymentProofUrl
    });

    // Validate form data
    if (customFields && customFields.length > 0) {
      const missingFields = [];
      customFields.forEach((field, idx) => {
        const isIndividualField = field.isIndividual && event.teamSize;
        if (field.required) {
          if (isIndividualField) {
            const participantCount = event.flexibleTeamSize ? selectedTeamSize : event.teamSize;
            for (let participantIdx = 0; participantIdx < participantCount; participantIdx++) {
              const fieldName = `field_${idx}_participant_${participantIdx}`;
              if (!formData[fieldName] || formData[fieldName].trim() === '') {
                missingFields.push(`${field.label} (Participant ${participantIdx + 1})`);
              }
            }
          } else {
            const fieldName = `field_${idx}`;
            if (!formData[fieldName] || formData[fieldName].trim() === '') {
              missingFields.push(field.label);
            }
          }
        }
      });
      
      if (missingFields.length > 0) {
        setPopupMessage(`Please fill in all required fields: ${missingFields.join(', ')}`);
        setShowErrorPopup(true);
        return;
      }
    }

    // Validate participants for team events or when no custom fields
    if ((!customFields || customFields.length === 0) && event.teamSize) {
      const participantCount = event.flexibleTeamSize ? selectedTeamSize : event.teamSize;
      if (participants.length !== participantCount) {
        setPopupMessage(`Please add ${participantCount} participants to your team.`);
        setShowErrorPopup(true);
        return;
      }
      
      const invalidParticipants = participants.filter(p => !p.name || !p.email || p.name.trim() === '' || p.email.trim() === '');
      if (invalidParticipants.length > 0) {
        setPopupMessage('Please fill in all participant details (name and email).');
        setShowErrorPopup(true);
        return;
      }
    }

    setSubmitting(true);
    setError('');
    
    try {
      // Map form data to custom field responses
      const responses = {};
      if (customFields && customFields.length > 0) {
        customFields.forEach((field, idx) => {
          const isIndividualField = field.isIndividual && event.teamSize;
          if (isIndividualField) {
            // For individual fields, don't store in responses - they'll be stored as participant records
            // Only store team-level fields in responses
            console.log(`Skipping individual field "${field.label}" from responses - will be stored as participant data`);
          } else {
            const fieldName = `field_${idx}`;
            responses[field.label] = formData[fieldName] || '';
          }
        });
      }

      // Prepare participants data
      let finalParticipants = [];
      if (event.teamSize) {
        // For team events, build participant data from individual fields
        const participantCount = event.flexibleTeamSize ? selectedTeamSize : event.teamSize;
        
        for (let participantIdx = 0; participantIdx < participantCount; participantIdx++) {
          let participantData = {};
          
          // Add individual field data for this participant
          if (customFields && customFields.length > 0) {
            customFields.forEach((field, idx) => {
              const isIndividualField = field.isIndividual && event.teamSize;
              if (isIndividualField) {
                const fieldName = `field_${idx}_participant_${participantIdx}`;
                if (formData[fieldName]) {
                  participantData[field.label] = formData[fieldName];
                }
              }
            });
          }
          
          // Add basic participant info if available
          if (participants[participantIdx]) {
            participantData = {
              ...participantData,
              name: participants[participantIdx].name || '',
              email: participants[participantIdx].email || ''
            };
          }
          
          // Only add if we have meaningful data
          if (Object.keys(participantData).length > 0) {
            finalParticipants.push(participantData);
          }
        }
      } else if (!customFields || customFields.length === 0) {
        // For solo events without custom fields, create a participant from form data
        let participantData = {};
        if (customFields && customFields.length > 0) {
          customFields.forEach((field, idx) => {
            const fieldName = `field_${idx}`;
            if (formData[fieldName]) {
              participantData[field.label] = formData[fieldName];
            }
          });
        } else {
          // If no custom fields, create a basic participant entry with user info
          participantData = {
            name: currentUser?.name || 'Participant',
            email: currentUser?.email || '',
            registrationTime: new Date().toISOString()
          };
        }
        if (Object.keys(participantData).length > 0) {
          finalParticipants = [participantData];
        }
      }

      // Ensure we have at least some participant data
      if (finalParticipants.length === 0 && (!customFields || customFields.length === 0)) {
        finalParticipants = [{
          name: currentUser?.name || 'Participant',
          email: currentUser?.email || '',
          registrationTime: new Date().toISOString()
        }];
      }

      console.log('Submitting registration with data:', {
        eventId: Number(subId),
        userId: currentUser?.id,
        responses,
        participants: finalParticipants,
        paymentEnabled: event.paymentEnabled,
        uploadedPaymentProofUrl
      });

      // Validate that we have some meaningful data
      if (Object.keys(responses).length === 0 && finalParticipants.length === 0) {
        setPopupMessage('Please fill in at least some registration information.');
        setShowErrorPopup(true);
        return;
      }

      if (event.paymentEnabled && uploadedPaymentProofUrl) {
        // Create waiting list entry with complete form data
        const waitingRes = await api.post('/waiting-list', {
          eventId: Number(subId),
          userId: currentUser?.id,
          responses: responses,
          participants: finalParticipants,
          paymentProof: uploadedPaymentProofUrl,
          status: 'pending'
        });
        
        console.log('Waiting list creation response:', waitingRes.data);
        
        // Show success popup for payment events (pending approval)
        setPopupMessage('🎉 Registration submitted successfully! Your form has been sent to the host for review. You will be notified once your registration is approved.');
        setShowSuccessPopup(true);
      } else if (event.paymentEnabled && !uploadedPaymentProofUrl) {
        // Payment is required but no proof uploaded
        setPopupMessage('Please upload a payment proof before submitting.');
        setShowErrorPopup(true);
        return;
      } else {
        // Free event, register directly
        const registrationResponse = await api.post('/registration', {
          eventId: Number(subId),
          userId: currentUser?.id,
          responses: responses,
          participants: finalParticipants,
        });
        
        console.log('Registration response:', registrationResponse.data);
        
        // Show success popup for free events (immediate registration)
        setPopupMessage('🎉 Registration successful! You are now registered for this event.');
        setShowSuccessPopup(true);
      }
    } catch (err) {
      console.error('Registration error:', err);
      
      // Handle different types of errors
      let errorMessage = 'Registration failed. Please try again later.';
      
      if (err.response?.status === 400) {
        errorMessage = err.response.data.error || 'Invalid registration data. Please check your information.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Event not found. Please check the event link.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else {
        errorMessage = err?.response?.data?.error || err?.message || 'Registration failed. Please try again later.';
      }
      
      setPopupMessage(errorMessage);
      setShowErrorPopup(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessPopupClose = () => {
    setShowSuccessPopup(false);
    navigate(`/events/${parentId}`);
  };

  const handleErrorPopupClose = () => {
    setShowErrorPopup(false);
  };

  if (loading) return <PageContainer><Loading /></PageContainer>;

  if (error) return (
    <PageContainer>
      <Card className="text-center">
        <div className="text-red-400 text-xl mb-4">Error Loading Event</div>
        <div className="text-gray-300 mb-6">{error}</div>
        <Button onClick={() => window.history.back()} variant="secondary">
          Go Back
        </Button>
      </Card>
    </PageContainer>
  );

  console.log('Rendering registration form with:', {
    event,
    customFields,
    formData,
    participants,
    teamSize: event?.teamSize,
    isTeamEvent: !!event?.teamSize,
    isSoloEvent: !event?.teamSize,
    fieldDetails: customFields?.map(field => ({
      label: field.label,
      type: field.type,
      isIndividual: field.isIndividual,
      required: field.required
    }))
  });

  if (!event) {
    return (
      <PageContainer>
        <Card className="text-center">
          <div className="text-gray-300 text-xl mb-4">No Event Data Available</div>
          <Button onClick={() => window.history.back()} variant="secondary">
            Go Back
          </Button>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      
      {/* Success Modal */}
      <Modal isOpen={showSuccessPopup} onClose={handleSuccessPopupClose}>
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          <h2 className="text-2xl font-bold text-white mb-4">Registration Submitted!</h2>
          <p className="text-gray-300 mb-6 leading-relaxed">{popupMessage}</p>
          <Button onClick={handleSuccessPopupClose} variant="success" className="px-8 py-3">
            Continue
          </Button>
        </div>
      </Modal>

      {/* Error Modal */}
      <Modal isOpen={showErrorPopup} onClose={handleErrorPopupClose}>
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">⚠️</div>
          <h2 className="text-2xl font-bold text-red-400 mb-4">Registration Failed</h2>
          <p className="text-gray-300 mb-6 leading-relaxed">{popupMessage}</p>
          <Button onClick={handleErrorPopupClose} variant="danger" className="px-8 py-3">
            Try Again
          </Button>
        </div>
      </Modal>

      {/* Payment Proof Upload Success Popup */}
      {showPaymentProofPopup && (
        <div
          className="fixed z-[2000] bg-green-500 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in pointer-events-auto"
          style={{
            top: '4.5rem', // 72px, a bit below header for desktop
            right: '2rem',
            minWidth: 240,
            maxWidth: '90vw',
            fontWeight: 600,
            fontSize: '1.1rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          }}
          role="status"
          aria-live="polite"
        >
          <span className="text-2xl">✅</span>
          <span>Payment proof uploaded successfully!</span>
          <style>{`
            @media (max-width: 640px) {
              .fixed.z-\[2000\] {
                top: 3.5rem !important;
                right: 0.5rem !important;
              }
            }
          `}</style>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <BackButton to={`/events/${parentId}`} variant="subtle" label="Mega Event" />
        </div>
        <Card as="form" onSubmit={handleSubmit} encType="multipart/form-data" className="p-8">
          <h2 className="text-3xl font-bold mb-2 text-center text-amber-400">Register for Event</h2>
          <h3 className="text-xl text-center text-gray-300 mb-6">{event.title}</h3>
          
          {error && (
            <div className="mb-6 p-4 bg-red-600/10 text-red-400 border border-red-400/30 rounded-lg text-center">
              {error}
            </div>
          )}
          
          {/* Show event type information */}
          {event.teamSize ? (
            <Card variant="info" className="mb-6 p-4">
              {event.flexibleTeamSize ? (
                <div className="text-center">
                  <p className="text-blue-300 font-medium mb-3">
                    🏆 Flexible Team Event: Choose your team size
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {getAvailableTeamSizes().map(size => (
                      <Button
                        key={size}
                        type="button"
                        onClick={() => handleTeamSizeSelect(size)}
                        variant={selectedTeamSize === size ? 'primary' : 'secondary'}
                        className="px-4 py-2"
                      >
                        {size} {size === 1 ? 'Participant' : 'Participants'}
                      </Button>
                    ))}
                  </div>
                  {selectedTeamSize && (
                    <p className="text-green-300 text-sm mt-3 font-medium">
                      ✅ Selected: {selectedTeamSize} participant{selectedTeamSize > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-blue-300 text-center font-medium">
                  🏆 Fixed Team Event: {event.teamSize} participant{parseInt(event.teamSize) > 1 ? 's' : ''} per team
                </p>
              )}
            </Card>
          ) : (
            <Card variant="success" className="mb-6 p-4">
              <p className="text-green-300 text-center font-medium">
                👤 Solo Event: Individual participation
              </p>
            </Card>
          )}
          
          {/* Show message if no custom fields are defined */}
          {(!customFields || customFields.length === 0) && (
            <Card variant="warning" className="mb-6 p-4">
              <p className="text-amber-300 text-center">
                This event uses a simple registration form. Add your details below.
              </p>
            </Card>
          )}

          {/* Custom Fields */}
          {customFields && customFields.length > 0 && customFields.map((field, idx) => {
            const isIndividualField = field.isIndividual && event.teamSize;
            const participantCount = isIndividualField ? (event.flexibleTeamSize ? selectedTeamSize : event.teamSize) : 1;
            
            return (
              <div key={idx} className="mb-6">
                {/* Field Header */}
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-lg font-bold text-white">
                    {field.label}
                    {field.required && <span className="text-red-400 ml-1">*</span>}
                  </h3>
                  {isIndividualField && (
                    <span className="px-2 py-1 bg-blue-400/20 border border-blue-400/30 rounded-lg text-blue-300 text-xs font-medium">
                      👤 Individual Field ({event.flexibleTeamSize ? selectedTeamSize : event.teamSize} entries)
                    </span>
                  )}
                  {!isIndividualField && event.teamSize && (
                    <span className="px-2 py-1 bg-green-400/20 border border-green-400/30 rounded-lg text-green-300 text-xs font-medium">
                      🏆 Team Field (1 entry)
                    </span>
                  )}
                </div>
                
                {/* Render field multiple times for individual fields */}
                {Array.from({ length: participantCount }, (_, participantIdx) => {
                  const fieldName = isIndividualField ? `field_${idx}_participant_${participantIdx}` : `field_${idx}`;
                  const fieldId = isIndividualField ? `field_${idx}_participant_${participantIdx}` : `field_${idx}`;
                  const participantLabel = isIndividualField ? ` (Participant ${participantIdx + 1})` : '';
                  
                  return (
                    <div key={participantIdx} className="mb-4">
                      {isIndividualField && (
                        <label className="block mb-2 text-sm font-medium text-blue-300">
                          Participant {participantIdx + 1}
                        </label>
                      )}
                      
                      {field.type === 'textarea' ? (
                        <Input
                          as="textarea"
                          name={fieldName}
                          id={fieldId}
                          value={formData[fieldName] || ''}
                          onChange={handleChange}
                          required={field.required}
                          placeholder={`Enter ${field.label.toLowerCase()}${participantLabel}`}
                          className="min-h-[100px] resize-vertical"
                        />
                      ) : field.type === 'dropdown' && field.options ? (
                        <Input
                          as="select"
                          name={fieldName}
                          id={fieldId}
                          value={formData[fieldName] || ''}
                          onChange={handleChange}
                          required={field.required}
                        >
                          <option value="">Select {field.label}{participantLabel}</option>
                          {field.options.map((option, optionIdx) => (
                            <option key={optionIdx} value={option.trim()}>
                              {option.trim()}
                            </option>
                          ))}
                        </Input>
                      ) : (
                        <Input
                          type={field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : 'text'}
                          name={fieldName}
                          id={fieldId}
                          value={formData[fieldName] || ''}
                          onChange={handleChange}
                          required={field.required}
                          placeholder={`Enter ${field.label.toLowerCase()}${participantLabel}`}
                          {...(field.type === 'number' && { min: 0 })}
                          {...(field.type === 'whatsapp' && { pattern: '[0-9]{10}', title: 'Please enter a 10-digit phone number' })}
                          {...(field.type === 'usn' && { pattern: '[0-9]{1}[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{3}', title: 'Please enter a valid USN format (e.g., 1MS20CS001)' })}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Only show participants section if no custom fields are defined */}
          {(!customFields || customFields.length === 0) && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block font-semibold text-white/80">
                  {event.teamSize ? 'Team Participants' : 'Participant Details'}
                </label>
                {event.teamSize && (
                  <span className="text-amber-300 text-sm font-medium">
                    {participants.length}/{event.flexibleTeamSize ? selectedTeamSize : event.teamSize} participants
                  </span>
                )}
              </div>
              {participants.map((p, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <Input
                    type="text"
                    placeholder="Name"
                    value={p.name || ''}
                    onChange={e => handleParticipantChange(idx, 'name', e.target.value)}
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={p.email || ''}
                    onChange={e => handleParticipantChange(idx, 'email', e.target.value)}
                    required
                  />
                </div>
              ))}
              {event.teamSize && participants.length < (event.flexibleTeamSize ? selectedTeamSize : event.teamSize) && (
                <Button
                  type="button"
                  onClick={addParticipant}
                  variant="ghost"
                  className="text-sm"
                >
                  + Add Participant
                </Button>
              )}
            </div>
          )}

          {/* QR Code Display for Payment */}
          {event.paymentEnabled && (
            <div className="mb-6">
              <Card variant="warning" className="p-6">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-amber-400 mb-2 flex items-center justify-center gap-2">
                    <span className="text-xl">💳</span>
                    Payment Required
                  </h3>
                  <p className="text-sm text-white/80">Scan the QR code below to make your payment</p>
                </div>
                
                <div className="flex flex-col items-center space-y-4">
                  {/* QR Code Display */}
                  {event.qrCode ? (
                    <div className="bg-white rounded-lg p-4 shadow-lg transform hover:scale-105 transition-transform duration-200">
                      <img
                        src={event.qrCode}
                        alt="Payment QR Code"
                        className="w-48 h-48 object-contain"
                        onError={(e) => {
                          console.error('Failed to load QR code image:', event.qrCode);
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div className="hidden text-center text-gray-500 text-sm">
                        QR Code image failed to load
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white/10 rounded-lg p-8 border-2 border-dashed border-white/20">
                      <div className="text-center text-white/60">
                        <div className="text-4xl mb-2">📱</div>
                        <p className="text-sm">QR Code not available</p>
                        <p className="text-xs text-white/40 mt-1">Please contact the event host</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Payment Instructions */}
                  <div className="text-center space-y-2 max-w-md">
                    <div className="bg-white/5 rounded-lg p-3 space-y-2">
                      <p className="text-sm text-white/70 flex items-center gap-2">
                        <span className="text-amber-300">📱</span>
                        <span><span className="font-semibold text-amber-300">Step 1:</span> Scan the QR code with your payment app</span>
                      </p>
                      <p className="text-sm text-white/70 flex items-center gap-2">
                        <span className="text-amber-300">💰</span>
                        <span><span className="font-semibold text-amber-300">Step 2:</span> Complete the payment</span>
                      </p>
                      <p className="text-sm text-white/70 flex items-center gap-2">
                        <span className="text-amber-300">📸</span>
                        <span><span className="font-semibold text-amber-300">Step 3:</span> Take a screenshot of the payment confirmation</span>
                      </p>
                      <p className="text-sm text-white/70 flex items-center gap-2">
                        <span className="text-amber-300">⬆️</span>
                        <span><span className="font-semibold text-amber-300">Step 4:</span> Upload the screenshot below</span>
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Payment Proof Upload */}
          {event.paymentEnabled && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block font-semibold text-white/80">
                  Payment Proof <span className="text-red-400">*</span>
                </label>
                {paymentPreview && (
                  <button
                    type="button"
                    onClick={handleRemovePaymentProof}
                    className="text-red-400 hover:text-red-300 text-sm font-medium"
                  >
                    Remove
                  </button>
                )}
              </div>
              
                          {paymentPreview ? (
              <div className="relative group">
                <img
                  src={uploadedPaymentProofUrl || paymentPreview}
                  alt="Payment proof preview"
                  className="w-full max-w-xs mx-auto rounded-lg border border-white/20 object-contain bg-white/5"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-all"
                  >
                    Change
                  </button>
                </div>
                <div className="text-center mt-2">
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 border border-green-500/30 rounded-full">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-400 font-medium">
                      {uploadedPaymentProofUrl ? '✅ Uploaded to Cloud' : '📸 Payment Proof Ready'}
                    </span>
                  </div>
                  {uploadedPaymentProofUrl && (
                    <p className="text-xs text-green-300 mt-1">Your payment proof is securely stored</p>
                  )}
                </div>
              </div>
            ) : (
                <div
                  className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${
                    dragActive
                      ? 'border-blue-400 bg-blue-400/10 scale-105'
                      : uploadError
                      ? 'border-red-400/50 bg-red-400/5 hover:border-red-400/70'
                      : 'border-white/30 hover:border-white/50 hover:bg-white/5 hover:scale-[1.02]'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={triggerFileInput}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      triggerFileInput();
                    }
                  }}
                  aria-label="Upload payment proof image"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    required
                    style={{ pointerEvents: 'auto' }}
                  />
                                  {isUploading ? (
                  <div className="flex flex-col items-center space-y-3">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
                      <div className="absolute inset-0 rounded-full border-2 border-blue-400/20"></div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-blue-300 font-medium">Uploading to Cloud...</p>
                      <p className="text-xs text-gray-400 mt-1">Please wait, this may take a moment</p>
                      <div className="mt-2 flex justify-center">
                        <div className="flex space-x-1">
                          <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></div>
                          <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-12 h-12 text-gray-400">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">
                        <span className="text-blue-400 font-medium">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG, GIF, WEBP up to 5MB</p>
                      <div className="mt-2 flex items-center justify-center gap-2 text-xs text-gray-400">
                        <span>📱 Screenshot of payment confirmation</span>
                      </div>
                    </div>
                  </div>
                )}
                </div>
              )}
              
              {uploadError && (
                <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <div className="text-red-400 text-lg">⚠️</div>
                    <div className="flex-1">
                      <p className="text-sm text-red-400 font-medium">Upload Error</p>
                      <p className="text-xs text-red-300 mt-1">{uploadError}</p>
                    </div>
                  </div>
                  {paymentPreview && (
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={retryUpload}
                        disabled={isRetrying}
                        className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        {isRetrying ? (
                          <>
                            <div className="w-3 h-3 border border-red-300 border-t-transparent rounded-full animate-spin"></div>
                            Retrying...
                          </>
                        ) : (
                          '🔄 Retry Upload'
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={triggerFileInput}
                        className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs rounded-md transition-colors"
                      >
                        📁 Choose Different File
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              <p className="text-sm text-gray-400 mt-2">
                Please upload a screenshot of your payment confirmation
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={submitting} 
            variant="primary"
            className="w-full py-3 font-semibold"
          >
            {submitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Submitting...
              </div>
            ) : (
              'Submit Registration'
            )}
          </Button>
        </Card>
      </div>
    </PageContainer>
  );
};

export default DynamicRegistrationForm;
