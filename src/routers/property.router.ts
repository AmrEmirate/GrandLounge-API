import { Router } from 'express';
import { PropertyController } from '../controllers/property.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { UserRole } from '../generated/prisma';
import roomRouter from './room.router';
import upload from '../middleware/upload.middleware';

const router = Router();
const tenantOnly = authMiddleware([UserRole.TENANT]);

// --- Endpoint Publik ---
router.get('/', PropertyController.getAll);
router.get('/cities', PropertyController.getCities);
router.get('/:id', PropertyController.getOne);
router.get('/:id/availability', PropertyController.getMonthlyAvailability);
router.get('/:id/available-rooms', PropertyController.getAvailableRooms);

// --- Endpoint Terproteksi untuk Tenant ---
router.post('/', tenantOnly, PropertyController.create);
router.get('/my-properties/all', tenantOnly, PropertyController.getPropertiesByTenant); // Middleware debug sudah dihapus
router.get('/my-properties/:id', tenantOnly, PropertyController.getPropertyByIdForTenant);
router.patch('/my-properties/:id', tenantOnly, PropertyController.update);
router.delete('/my-properties/:id', tenantOnly, PropertyController.delete);
router.patch(
    '/my-properties/:id/upload-image',
    tenantOnly,
    upload.single('propertyImage'),
    PropertyController.uploadImage
);
router.post(
    '/my-properties/:id/gallery',
    tenantOnly,
    upload.array('galleryImages', 10),
    PropertyController.uploadGallery
);

// Rute untuk Kamar
router.use('/my-properties/:propertyId/rooms', tenantOnly, roomRouter);

export default router;