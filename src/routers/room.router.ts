import { Router } from 'express';
import { RoomController } from '../controllers/room.controller';
import upload from '../middleware/upload.middleware';
import roomAvailabilityRouter from './roomAvailability.router';
import { authMiddleware } from '../middleware/auth.middleware';
import { UserRole } from '../generated/prisma';

const router = Router({ mergeParams: true });
const tenantOnly = authMiddleware([UserRole.TENANT]);

// Endpoint baru untuk mengambil ketersediaan bulanan
router.get(
  '/:roomId/availability-by-month',
  tenantOnly,
  RoomController.getMonthlyAvailability
);

// Endpoint CRUD untuk kamar
router.post('/', tenantOnly, RoomController.create);
router.get('/', tenantOnly, RoomController.getAllByProperty);
router.get('/:roomId', tenantOnly, RoomController.getById);
router.patch('/:roomId', tenantOnly, RoomController.update);
router.delete('/:roomId', tenantOnly, RoomController.delete);

// Endpoint untuk galeri kamar
router.post(
  '/:roomId/gallery',
  tenantOnly,
  upload.array('roomGalleryImages', 5),
  RoomController.uploadGallery
);

// Menggunakan sub-router untuk ketersediaan
router.use('/:roomId/availability', roomAvailabilityRouter);

export default router;