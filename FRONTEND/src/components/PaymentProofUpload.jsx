import React, { useState, useRef } from 'react';
import Button from './ui/Button';
import Card from './ui/Card';
import api from '../services/api';

const PaymentProofUpload = ({ 
  onUploadSuccess, 
  onUploadError, 
  waitingListId, 
  registrationId,
  existingProof = null,
  onDelete = null 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(existingProof);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

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

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    uploadFile(file);
  };

  const uploadFile = async (file) => {
    setIsUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('paymentProof', file);
    
    if (waitingListId) {
      formData.append('waitingListId', waitingListId);
    }
    if (registrationId) {
      formData.append('registrationId', registrationId);
    }

    try {
      const response = await api.post('/upload/payment-proof', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = response.data;
      setPreview(data.paymentProof);
      onUploadSuccess?.(data);
      
    } catch (err) {
      setError(err.message);
      setPreview(null);
      onUploadError?.(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    try {
      const type = waitingListId ? 'waiting-list' : 'registration';
      const id = waitingListId || registrationId;
      await api.delete(`/upload/payment-proof/${type}/${id}`);
      setPreview(null);
      onDelete();
      
    } catch (err) {
      setError(err.message);
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
          <h4 className="text-sm font-semibold text-white">Payment Proof</h4>
          <p className="text-xs text-gray-400">Upload payment screenshot</p>
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
            alt="Payment proof preview"
            className="w-full max-w-xs mx-auto rounded-lg border border-white/20 object-contain bg-white/5"
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
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

export default PaymentProofUpload; 