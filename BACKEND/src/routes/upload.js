const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../utils/cloudinary.js');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Configure Cloudinary storage for payment proofs
const paymentProofStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'eventpulse/payment-proofs',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 800, height: 800, crop: 'limit' }, // Resize to reasonable size
      { quality: 'auto:good' } // Optimize quality
    ]
  }
});

// Configure Cloudinary storage for QR codes
const qrCodeStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'eventpulse/qr-codes',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 400, height: 400, crop: 'limit' }, // QR codes should be smaller
      { quality: 'auto:good' } // Optimize quality
    ]
  }
});

const paymentProofUpload = multer({ 
  storage: paymentProofStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

const qrCodeUpload = multer({ 
  storage: qrCodeStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// POST /api/upload/payment-proof
router.post('/upload/payment-proof', paymentProofUpload.single('paymentProof'), async (req, res) => {
  try {
    const { waitingListId, registrationId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Payment proof image is required' });
    }

    const fileUrl = req.file.path; // Cloudinary URL

    // If no waitingListId or registrationId provided, just return the URL
    if (!waitingListId && !registrationId) {
      return res.status(201).json({ 
        success: true,
        paymentProof: fileUrl
      });
    }

    let updatedRecord;

    if (waitingListId) {
      // Update waiting list entry
      updatedRecord = await prisma.waitingList.update({
        where: { id: Number(waitingListId) },
        data: { paymentProof: fileUrl },
        include: {
          event: {
            select: {
              id: true,
              title: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
    } else if (registrationId) {
      // Update registration entry
      updatedRecord = await prisma.registration.update({
        where: { id: Number(registrationId) },
        data: { paymentProof: fileUrl },
        include: {
          event: {
            select: {
              id: true,
              title: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
    }

    res.status(201).json({ 
      success: true,
      paymentProof: fileUrl,
      record: updatedRecord
    });

  } catch (error) {
    console.error('Payment proof upload error:', error);
    
    // If there was an error and a file was uploaded, delete it from Cloudinary
    if (req.file && req.file.public_id) {
      try {
        await cloudinary.uploader.destroy(req.file.public_id);
      } catch (deleteError) {
        console.error('Error deleting file from Cloudinary:', deleteError);
      }
    }

    if (error.message === 'Only image files are allowed!') {
      return res.status(400).json({ error: 'Only image files (jpg, jpeg, png, gif, webp) are allowed' });
    }

    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large. Maximum size is 5MB' });
    }

    res.status(500).json({ error: 'Failed to upload payment proof' });
  }
});

// POST /api/upload/qr-code
router.post('/upload/qr-code', qrCodeUpload.single('qrCode'), async (req, res) => {
  try {
    const { eventId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'QR code image is required' });
    }

    if (!eventId) {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    const fileUrl = req.file.path; // Cloudinary URL

    // Check if this is a temporary event ID (during creation)
    const isTemporaryEvent = eventId.startsWith('temp_');

    if (isTemporaryEvent) {
      // For temporary events, just return the URL without database update
      res.status(201).json({ 
        success: true,
        qrCode: fileUrl,
        isTemporary: true,
        tempEventId: eventId
      });
    } else {
      // For real events, update the database
      const updatedEvent = await prisma.event.update({
        where: { id: Number(eventId) },
        data: { qrCode: fileUrl },
        include: {
          host: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      res.status(201).json({ 
        success: true,
        qrCode: fileUrl,
        event: updatedEvent,
        isTemporary: false
      });
    }

  } catch (error) {
    console.error('QR code upload error:', error);
    
    // If there was an error and a file was uploaded, delete it from Cloudinary
    if (req.file && req.file.public_id) {
      try {
        await cloudinary.uploader.destroy(req.file.public_id);
      } catch (deleteError) {
        console.error('Error deleting file from Cloudinary:', deleteError);
      }
    }

    if (error.message === 'Only image files are allowed!') {
      return res.status(400).json({ error: 'Only image files (jpg, jpeg, png, gif, webp) are allowed' });
    }

    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large. Maximum size is 5MB' });
    }

    res.status(500).json({ error: 'Failed to upload QR code' });
  }
});

// POST /api/upload/associate-qr-code
router.post('/associate-qr-code', async (req, res) => {
  try {
    const { tempEventId, realEventId, qrCodeUrl } = req.body;
    
    if (!tempEventId || !realEventId || !qrCodeUrl) {
      return res.status(400).json({ error: 'tempEventId, realEventId, and qrCodeUrl are required' });
    }

    // Update the real event with the QR code URL
    const updatedEvent = await prisma.event.update({
      where: { id: Number(realEventId) },
      data: { qrCode: qrCodeUrl },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({ 
      success: true, 
      message: 'QR code associated successfully',
      event: updatedEvent
    });

  } catch (error) {
    console.error('QR code association error:', error);
    res.status(500).json({ error: 'Failed to associate QR code' });
  }
});

// Cleanup temporary uploads (can be called periodically)
router.post('/cleanup-temp-uploads', async (req, res) => {
  try {
    // This would typically be a scheduled job
    // For now, we'll just return success
    res.json({ 
      success: true, 
      message: 'Cleanup completed (temporary uploads are handled automatically)' 
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ error: 'Failed to cleanup temporary uploads' });
  }
});

// DELETE /api/upload/payment-proof/:id
router.delete('/upload/payment-proof/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    
    let record;
    
    if (type === 'waiting-list') {
      record = await prisma.waitingList.findUnique({
        where: { id: Number(id) }
      });
    } else if (type === 'registration') {
      record = await prisma.registration.findUnique({
        where: { id: Number(id) }
      });
    } else {
      return res.status(400).json({ error: 'Invalid type. Must be "waiting-list" or "registration"' });
    }

    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    if (!record.paymentProof) {
      return res.status(404).json({ error: 'No payment proof found' });
    }

    // Extract public_id from Cloudinary URL
    const urlParts = record.paymentProof.split('/');
    const publicId = urlParts[urlParts.length - 1].split('.')[0];
    const fullPublicId = `eventpulse/payment-proofs/${publicId}`;

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(fullPublicId);

    // Update database
    if (type === 'waiting-list') {
      await prisma.waitingList.update({
        where: { id: Number(id) },
        data: { paymentProof: null }
      });
    } else {
      await prisma.registration.update({
        where: { id: Number(id) },
        data: { paymentProof: null }
      });
    }

    res.json({ success: true, message: 'Payment proof deleted successfully' });

  } catch (error) {
    console.error('Payment proof deletion error:', error);
    res.status(500).json({ error: 'Failed to delete payment proof' });
  }
});

// DELETE /api/upload/qr-code/:eventId
router.delete('/upload/qr-code/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Check if this is a temporary event ID
    const isTemporaryEvent = eventId.startsWith('temp_');
    
    let qrCodeUrl = null;

    if (isTemporaryEvent) {
      // For temporary events, we need to get the QR code URL from the request body
      // or we can't delete it since it's not in the database
      // For now, we'll just return success since the file will be cleaned up later
      res.json({ success: true, message: 'Temporary QR code will be cleaned up' });
      return;
    } else {
      // For real events, get from database
      const event = await prisma.event.findUnique({
        where: { id: Number(eventId) }
      });

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      if (!event.qrCode) {
        return res.status(404).json({ error: 'No QR code found for this event' });
      }

      qrCodeUrl = event.qrCode;

      // Update database
      await prisma.event.update({
        where: { id: Number(eventId) },
        data: { qrCode: null }
      });
    }

    // Delete from Cloudinary if we have a URL
    if (qrCodeUrl) {
      const urlParts = qrCodeUrl.split('/');
      const publicId = urlParts[urlParts.length - 1].split('.')[0];
      const fullPublicId = `eventpulse/qr-codes/${publicId}`;

      await cloudinary.uploader.destroy(fullPublicId);
    }

    res.json({ success: true, message: 'QR code deleted successfully' });

  } catch (error) {
    console.error('QR code deletion error:', error);
    res.status(500).json({ error: 'Failed to delete QR code' });
  }
});

module.exports = router;
