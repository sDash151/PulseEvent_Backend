const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://pulseevent-backend.onrender.com';

export const paymentProofService = {
  /**
   * Upload payment proof image
   * @param {File} file - The image file to upload
   * @param {Object} options - Upload options
   * @param {number} options.waitingListId - ID of waiting list entry (optional)
   * @param {number} options.registrationId - ID of registration entry (optional)
   * @returns {Promise<Object>} Upload result
   */
  async uploadPaymentProof(file, { waitingListId, registrationId }) {
    const formData = new FormData();
    formData.append('paymentProof', file);
    
    if (waitingListId) {
      formData.append('waitingListId', waitingListId);
    }
    if (registrationId) {
      formData.append('registrationId', registrationId);
    }

    const response = await fetch(`${API_BASE_URL}/api/upload/payment-proof`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  },

  /**
   * Upload QR code image for an event
   * @param {File} file - The QR code image file to upload
   * @param {number} eventId - ID of the event
   * @returns {Promise<Object>} Upload result
   */
  async uploadQRCode(file, eventId) {
    const formData = new FormData();
    formData.append('qrCode', file);
    formData.append('eventId', eventId);

    const response = await fetch(`${API_BASE_URL}/api/upload/qr-code`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'QR code upload failed');
    }

    return response.json();
  },

  /**
   * Delete payment proof
   * @param {string} type - Type of record ('waiting-list' or 'registration')
   * @param {number} id - ID of the record
   * @returns {Promise<Object>} Delete result
   */
  async deletePaymentProof(type, id) {
    const response = await fetch(`${API_BASE_URL}/api/upload/payment-proof/${type}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Delete failed');
    }

    return response.json();
  },

  /**
   * Delete QR code for an event
   * @param {number} eventId - ID of the event
   * @returns {Promise<Object>} Delete result
   */
  async deleteQRCode(eventId) {
    const response = await fetch(`${API_BASE_URL}/api/upload/qr-code/${eventId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'QR code delete failed');
    }

    return response.json();
  },

  /**
   * Validate file before upload
   * @param {File} file - File to validate
   * @returns {Object} Validation result
   */
  validateFile(file) {
    const errors = [];

    // Check file type
    if (!file.type.startsWith('image/')) {
      errors.push('Only image files are allowed');
    }

    // Check file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      errors.push('File size must be less than 5MB');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Get file preview URL
   * @param {File} file - File to create preview for
   * @returns {Promise<string>} Preview URL
   */
  getFilePreview(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
};

export default paymentProofService; 