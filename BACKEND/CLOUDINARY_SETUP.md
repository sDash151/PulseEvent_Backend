# Cloudinary QR Payment Upload Setup Guide

## Prerequisites

1. **Cloudinary Account**: Sign up at [cloudinary.com](https://cloudinary.com)
2. **Environment Variables**: Add the following to your `.env` file

## Environment Variables

Add these to your `BACKEND/.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

## How to Get Cloudinary Credentials

1. **Log in to Cloudinary Dashboard**
2. **Go to Account Details** (top right corner)
3. **Copy the following values**:
   - Cloud Name
   - API Key
   - API Secret

## Features Implemented

### Backend Features
- ✅ Cloudinary integration with multer-storage-cloudinary
- ✅ Image upload with automatic optimization (800x800 max, auto quality)
- ✅ File validation (image types only, 5MB limit)
- ✅ Support for both waiting list and registration entries
- ✅ Automatic cleanup on upload errors
- ✅ Delete functionality with Cloudinary cleanup
- ✅ Comprehensive error handling

### Frontend Features
- ✅ Drag & drop file upload
- ✅ Image preview
- ✅ File validation
- ✅ Upload progress indicator
- ✅ Error handling and display
- ✅ Delete functionality
- ✅ Responsive design

## API Endpoints

### Upload Payment Proof
```
POST /api/upload/payment-proof
Content-Type: multipart/form-data

Body:
- paymentProof: File (required)
- waitingListId: number (optional)
- registrationId: number (optional)
```

**Response:**
```json
{
  "success": true,
  "paymentProof": "https://res.cloudinary.com/...",
  "record": { /* updated record data */ }
}
```

### Delete Payment Proof
```
DELETE /api/upload/payment-proof/:type/:id

Params:
- type: "waiting-list" | "registration"
- id: number
```

**Response:**
```json
{
  "success": true,
  "message": "Payment proof deleted successfully"
}
```

## Usage Examples

### In React Component
```jsx
import PaymentProofUpload from './components/PaymentProofUpload';

function MyComponent() {
  const handleUploadSuccess = (data) => {
    console.log('Upload successful:', data.paymentProof);
  };

  const handleUploadError = (error) => {
    console.error('Upload failed:', error);
  };

  return (
    <PaymentProofUpload
      waitingListId={123}
      onUploadSuccess={handleUploadSuccess}
      onUploadError={handleUploadError}
    />
  );
}
```

### Using the Service
```javascript
import { paymentProofService } from './services/paymentProof';

// Upload
const result = await paymentProofService.uploadPaymentProof(file, {
  waitingListId: 123
});

// Delete
await paymentProofService.deletePaymentProof('waiting-list', 123);
```

## File Storage Structure

Images are stored in Cloudinary with the following structure:
- **Folder**: `eventpulse/payment-proofs/`
- **Transformations**: 
  - Max size: 800x800 pixels
  - Quality: Auto-optimized
  - Format: Original format preserved

## Security Features

1. **File Type Validation**: Only image files allowed
2. **File Size Limit**: 5MB maximum
3. **Automatic Cleanup**: Failed uploads are cleaned from Cloudinary
4. **Error Handling**: Comprehensive error messages
5. **Input Validation**: Server-side validation of all inputs

## Testing

1. **Start the backend server**:
   ```bash
   cd BACKEND
   npm run dev
   ```

2. **Test upload endpoint**:
   ```bash
   curl -X POST http://localhost:3000/api/upload/payment-proof \
     -F "paymentProof=@/path/to/image.jpg" \
     -F "waitingListId=1"
   ```

3. **Test delete endpoint**:
   ```bash
   curl -X DELETE http://localhost:3000/api/upload/payment-proof/waiting-list/1
   ```

## Troubleshooting

### Common Issues

1. **"Only image files are allowed"**
   - Ensure you're uploading an image file (jpg, jpeg, png, gif, webp)

2. **"File size too large"**
   - Reduce image size to under 5MB

3. **"Cloudinary configuration error"**
   - Check your environment variables are correctly set
   - Verify your Cloudinary credentials

4. **"Upload failed"**
   - Check network connection
   - Verify Cloudinary account has sufficient credits
   - Check server logs for detailed error

### Environment Variable Issues

Make sure your `.env` file is in the `BACKEND` directory and contains:
```env
CLOUDINARY_CLOUD_NAME=your-actual-cloud-name
CLOUDINARY_API_KEY=your-actual-api-key
CLOUDINARY_API_SECRET=your-actual-api-secret
```

## Next Steps

1. **Test the upload functionality** with different image types
2. **Integrate with your registration/waiting list forms**
3. **Add admin interface** for managing payment proofs
4. **Implement payment verification workflow**
5. **Add email notifications** for payment proof uploads

## Support

If you encounter any issues:
1. Check the server logs for detailed error messages
2. Verify your Cloudinary credentials
3. Ensure all dependencies are installed
4. Check that your database schema is up to date 