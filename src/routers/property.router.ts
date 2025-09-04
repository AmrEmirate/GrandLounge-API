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

// Endpoint untuk membuat properti baru (tidak berubah)
router.post('/', 
  tenantOnly, 
  upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'galleryImages', maxCount: 10 }
  ]), 
  PropertyController.create
);

// --- Endpoint Terproteksi untuk Tenant ---
router.get('/my-properties/all', tenantOnly, PropertyController.getPropertiesByTenant);
router.get('/my-properties/:id', tenantOnly, PropertyController.getPropertyByIdForTenant);

// --- PERBAIKAN KUNCI DI SINI ---
// Tambahkan middleware 'upload.fields' untuk rute update
router.patch('/my-properties/:id', 
  tenantOnly,
  upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'galleryImages', maxCount: 10 }
  ]),
  PropertyController.update
);
// --- AKHIR PERBAIKAN ---

router.delete('/my-properties/:id', tenantOnly, PropertyController.delete);

// Rute upload yang sudah ada tidak perlu diubah
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