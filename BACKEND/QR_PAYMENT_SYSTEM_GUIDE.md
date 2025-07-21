# Complete QR Payment Upload System Guide

## Overview

This system provides a complete QR payment solution for EventPulse with two main components:

1. **Host QR Code Upload**: Hosts can upload QR codes when creating sub-events
2. **Participant Payment Proof Upload**: Participants can upload payment screenshots during registration

## System Architecture

### Database Schema
- **Event Model**: Added `qrCode` field to store QR code URLs
- **Registration Model**: Has `paymentProof` field for participant uploads
- **WaitingList Model**: Has `paymentProof` field for participant uploads

### Cloudinary Storage Structure
```
eventpulse/
├── qr-codes/          # Host QR codes (400x400, optimized)
└── payment-proofs/    # Participant payment proofs (800x800, optimized)
```

## Backend Implementation

### 1. Database Migration
```bash
npx prisma migrate dev --name add_qr_code_to_event
```

### 2. Upload Routes (`/api/upload`)

#### QR Code Upload for Events
```
POST /api/upload/qr-code
Content-Type: multipart/form-data

Body:
- qrCode: File (required)
- eventId: number (required)
```

#### Payment Proof Upload
```
POST /api/upload/payment-proof
Content-Type: multipart/form-data

Body:
- paymentProof: File (required)
- waitingListId: number (optional)
- registrationId: number (optional)
```

#### Delete Endpoints
```
DELETE /api/upload/qr-code/:eventId
DELETE /api/upload/payment-proof/:type/:id
```

### 3. Features
- ✅ Automatic image optimization
- ✅ File type validation (images only)
- ✅ File size limits (5MB)
- ✅ Automatic cleanup on errors
- ✅ Separate storage folders
- ✅ Comprehensive error handling

## Frontend Implementation

### 1. Components

#### QRCodeUpload Component
- Drag & drop interface
- Image preview
- Upload progress
- Delete functionality
- Handles both creation and editing modes

#### PaymentProofUpload Component
- Drag & drop interface
- Image preview
- Upload progress
- Delete functionality
- Supports both registration and waiting list

### 2. Integration Points

#### SubEventForm Integration
```jsx
<QRCodeUpload
  eventId={null} // null during creation
  onUploadSuccess={(data) => {
    setQrImage(data.qrCode);
    setQrPreview(data.qrCode);
  }}
  onUploadError={(error) => {
    console.error('QR code upload failed:', error);
  }}
  existingQRCode={qrPreview}
  onDelete={() => {
    setQrImage(null);
    setQrPreview(null);
  }}
/>
```

#### Registration Form Integration
```jsx
<PaymentProofUpload
  waitingListId={waitingListId}
  onUploadSuccess={(data) => {
    // Handle successful upload
  }}
  onUploadError={(error) => {
    // Handle upload error
  }}
  existingProof={existingProof}
  onDelete={handleDelete}
/>
```

## Environment Variables

Add to your `BACKEND/.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

## Usage Workflows

### 1. Host Creates Sub-Event with QR Code

1. **Host enables payment** in sub-event form
2. **QRCodeUpload component** appears
3. **Host uploads QR code** (drag & drop or click)
4. **Image is optimized** and stored in Cloudinary
5. **QR code URL** is saved with the event

### 2. Participant Registers with Payment Proof

1. **Participant fills registration form**
2. **PaymentProofUpload component** appears (if required)
3. **Participant uploads payment screenshot**
4. **Image is optimized** and stored in Cloudinary
5. **Payment proof URL** is saved with registration

### 3. Host Reviews Payment Proofs

1. **Host views registration list**
2. **Payment proof images** are displayed
3. **Host can approve/reject** registrations
4. **Payment proofs can be deleted** if needed

## API Response Examples

### Successful QR Code Upload
```json
{
  "success": true,
  "qrCode": "https://res.cloudinary.com/your-cloud/image/upload/v123/eventpulse/qr-codes/abc123.jpg",
  "event": {
    "id": 123,
    "title": "Workshop",
    "qrCode": "https://res.cloudinary.com/your-cloud/image/upload/v123/eventpulse/qr-codes/abc123.jpg",
    "host": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

### Successful Payment Proof Upload
```json
{
  "success": true,
  "paymentProof": "https://res.cloudinary.com/your-cloud/image/upload/v123/eventpulse/payment-proofs/def456.jpg",
  "record": {
    "id": 456,
    "paymentProof": "https://res.cloudinary.com/your-cloud/image/upload/v123/eventpulse/payment-proofs/def456.jpg",
    "event": {
      "id": 123,
      "title": "Workshop"
    },
    "user": {
      "id": 2,
      "name": "Jane Smith",
      "email": "jane@example.com"
    }
  }
}
```

## Error Handling

### Common Error Responses
```json
{
  "error": "Only image files (jpg, jpeg, png, gif, webp) are allowed"
}
```

```json
{
  "error": "File size too large. Maximum size is 5MB"
}
```

```json
{
  "error": "Event ID is required"
}
```

## Security Features

1. **File Type Validation**: Only image files allowed
2. **File Size Limits**: 5MB maximum per file
3. **Automatic Cleanup**: Failed uploads are removed from Cloudinary
4. **Input Validation**: Server-side validation of all inputs
5. **Error Handling**: Comprehensive error messages

## Performance Optimizations

1. **Image Optimization**: Automatic resizing and quality optimization
2. **CDN Delivery**: Cloudinary provides global CDN
3. **Lazy Loading**: Images load only when needed
4. **Caching**: Cloudinary handles image caching

## Testing

### Test QR Code Upload
```bash
curl -X POST http://localhost:3000/api/upload/qr-code \
  -F "qrCode=@/path/to/qr-code.jpg" \
  -F "eventId=123"
```

### Test Payment Proof Upload
```bash
curl -X POST http://localhost:3000/api/upload/payment-proof \
  -F "paymentProof=@/path/to/payment.jpg" \
  -F "registrationId=456"
```

### Test Delete Operations
```bash
curl -X DELETE http://localhost:3000/api/upload/qr-code/123
curl -X DELETE http://localhost:3000/api/upload/payment-proof/registration/456
```

## Troubleshooting

### Common Issues

1. **"Cloudinary configuration error"**
   - Check environment variables
   - Verify Cloudinary credentials

2. **"File upload failed"**
   - Check file size (must be < 5MB)
   - Verify file type (images only)
   - Check network connection

3. **"Event not found"**
   - Verify event ID exists
   - Check database connection

4. **"Permission denied"**
   - Check file permissions
   - Verify Cloudinary account status

### Debug Steps

1. **Check server logs** for detailed error messages
2. **Verify environment variables** are correctly set
3. **Test Cloudinary credentials** manually
4. **Check database connectivity**
5. **Verify file upload permissions**

## Next Steps

1. **Add payment verification workflow**
2. **Implement admin interface** for managing payment proofs
3. **Add email notifications** for payment uploads
4. **Create payment analytics dashboard**
5. **Add bulk payment proof management**

## Support

For issues or questions:
1. Check the server logs
2. Verify your Cloudinary setup
3. Test with the provided curl commands
4. Review the error handling section 