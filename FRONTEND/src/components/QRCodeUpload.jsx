import React, { useState, useRef } from 'react';
import Button from './ui/Button';
import api from '../services/api';
import Card from './ui/Card';

const QRCodeUpload = ({ 
  onUploadSuccess, 
  onUploadError, 
  eventId,
  existingQRCode = null,
  onDelete = null 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(existingQRCode);
  const [error, setError] = useState('');
  const [tempEventId, setTempEventId] = useState(null);
  const fileInputRef = useRef(null);

  // Generate temporary event ID for uploads during creation
  const getOrCreateTempEventId = () => {
    if (eventId) return eventId;
    if (!tempEventId) {
      const newTempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setTempEventId(newTempId);
      return newTempId;
    }
    return tempEventId;
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

  const handleFile = (file) => {
    setError('');
    
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    // Create immediate preview for better UX
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary immediately
    uploadFile(file);
  };

  const uploadFile = async (file) => {
    setIsUploading(true);
    setError('');

    const currentEventId = getOrCreateTempEventId();
    const formData = new FormData();
    formData.append('qrCode', file);
    formData.append('eventId', currentEventId);

    try {
      console.log('Uploading QR code for event:', currentEventId);
      const response = await api.post('/upload/qr-code', formData);
      console.log('QR code upload successful:', response.data);

      setPreview(response.data.qrCode);
      onUploadSuccess?.(response.data);
      
    } catch (err) {
      console.error('QR code upload error:', err);
      console.error('Upload error details:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: '/upload/qr-code'
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
      
      setError(errorMessage);
      setPreview(null);
      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    const currentEventId = getOrCreateTempEventId();

    try {
      console.log('Deleting QR code for event:', currentEventId);
      await api.delete(`/upload/qr-code/${currentEventId}`);
      console.log('QR code deletion successful');

      setPreview(null);
      onDelete();
      
    } catch (err) {
      console.error('QR code deletion error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to delete QR code');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-white">QR Code</h4>
          <p className="text-xs text-gray-400">Upload payment QR code</p>
        </div>
        {preview && onDelete && (
          <Button
            onClick={handleDelete}
            variant="danger"
            size="sm"
            className="text-xs px-2 py-1"
          >
            Remove
          </Button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Upload Area */}
      {preview ? (
        <div className="relative group">
          <img
            src={preview}
            alt="QR code preview"
            className="w-24 h-24 md:w-32 md:h-32 mx-auto rounded-lg border border-white/20 object-contain bg-white/5"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <Button
              onClick={triggerFileInput}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Change
            </Button>
          </div>
          <div className="text-center mt-2">
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 border border-green-500/30 rounded-full">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
              <span className="text-xs text-green-400">Uploaded</span>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer ${
            dragActive
              ? 'border-blue-400 bg-blue-400/10'
              : 'border-white/30 hover:border-white/50 hover:bg-white/5'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
        >
          {isUploading ? (
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
              <span className="text-xs text-gray-300">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <div className="w-8 h-8 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-300">
                  <span className="text-blue-400 font-medium">Click to upload</span> or drag
                </p>
                <p className="text-xs text-gray-500 mt-0.5">PNG, JPG up to 5MB</p>
              </div>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default QRCodeUpload; 