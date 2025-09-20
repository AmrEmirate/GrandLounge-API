import { Router } from 'express';
import { PropertyController } from '../controllers/property.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { UserRole } from '../generated/prisma';
import roomRouter from './room.router';
import upload from '../middleware/upload.middleware';

const router = Router();
const tenantOnly = authMiddleware([UserRole.TENANT]);

// =================================================================
//                      ENDPOINT PUBLIK
// =================================================================

// Mendapatkan semua properti (dengan filter dan paginasi)
router.get('/', PropertyController.getAll);

router.get('/nearby', PropertyController.getNearbyProperties);
// Mendapatkan detail satu properti
router.get('/:id', PropertyController.getOne);

// Mendapatkan ketersediaan bulanan untuk properti
router.get('/:id/availability', PropertyController.getMonthlyAvailability);

// Mendapatkan kamar yang tersedia berdasarkan tanggal
router.get('/:id/available-rooms', PropertyController.getAvailableRooms);


// =================================================================
//                  ENDPOINT KHUSUS TENANT
// =================================================================

// Nested router untuk mengelola kamar dalam sebuah properti
router.use('/my-properties/:propertyId/rooms', tenantOnly, roomRouter);

// --- Pengelolaan Properti oleh Tenant ---

// Membuat properti baru (dengan upload gambar)
router.post('/', 
  tenantOnly, 
  upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'galleryImages', maxCount: 10 }
  ]), 
  PropertyController.create
);

// Mendapatkan semua properti milik tenant yang sedang login
router.get('/my-properties/all', tenantOnly, PropertyController.getPropertiesByTenant);

// Mendapatkan detail satu properti milik tenant
router.get('/my-properties/:id', tenantOnly, PropertyController.getPropertyByIdForTenant);

// Memperbarui detail properti (dengan upload gambar baru & penghapusan gambar lama)
router.patch('/my-properties/:id', 
  tenantOnly, 
  upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'galleryImages', maxCount: 10 }
  ]),
  PropertyController.update
);

// Menghapus (soft delete) properti
router.delete('/my-properties/:id', tenantOnly, PropertyController.delete);


// --- Rute Tambahan untuk Upload Gambar (jika masih diperlukan) ---
// Catatan: Rute ini mungkin menjadi redundan karena fungsi update sudah menangani upload.
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

router.get('/nearby', PropertyController.getNearbyProperties);

export default router;