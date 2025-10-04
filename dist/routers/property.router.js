"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const property_controller_1 = require("../controllers/property.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const client_1 = require("../../prisma/generated/client");
const room_router_1 = __importDefault(require("./room.router"));
const upload_middleware_1 = __importDefault(require("../middleware/upload.middleware"));
const router = (0, express_1.Router)();
const tenantOnly = (0, auth_middleware_1.authMiddleware)([client_1.UserRole.TENANT]);
// =================================================================
//                      ENDPOINT PUBLIK
// =================================================================
// Mendapatkan semua properti (dengan filter dan paginasi)
router.get('/', property_controller_1.PropertyController.getAll);
router.get('/nearby', property_controller_1.PropertyController.getNearbyProperties);
// Mendapatkan detail satu properti
router.get('/:id', property_controller_1.PropertyController.getOne);
// Mendapatkan ketersediaan bulanan untuk properti
router.get('/:id/availability', property_controller_1.PropertyController.getMonthlyAvailability);
// Mendapatkan kamar yang tersedia berdasarkan tanggal
router.get('/:id/available-rooms', property_controller_1.PropertyController.getAvailableRooms);
// =================================================================
//                  ENDPOINT KHUSUS TENANT
// =================================================================
// Nested router untuk mengelola kamar dalam sebuah properti
router.use('/my-properties/:propertyId/rooms', tenantOnly, room_router_1.default);
// --- Pengelolaan Properti oleh Tenant ---
// Membuat properti baru (dengan upload gambar)
router.post('/', tenantOnly, upload_middleware_1.default.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'galleryImages', maxCount: 10 }
]), property_controller_1.PropertyController.create);
// Mendapatkan semua properti milik tenant yang sedang login
router.get('/my-properties/all', tenantOnly, property_controller_1.PropertyController.getPropertiesByTenant);
// Mendapatkan detail satu properti milik tenant
router.get('/my-properties/:id', tenantOnly, property_controller_1.PropertyController.getPropertyByIdForTenant);
// Memperbarui detail properti (dengan upload gambar baru & penghapusan gambar lama)
router.patch('/my-properties/:id', tenantOnly, upload_middleware_1.default.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'galleryImages', maxCount: 10 }
]), property_controller_1.PropertyController.update);
// Menghapus (soft delete) properti
router.delete('/my-properties/:id', tenantOnly, property_controller_1.PropertyController.delete);
router.patch('/my-properties/:id/upload-image', tenantOnly, upload_middleware_1.default.single('propertyImage'), property_controller_1.PropertyController.uploadImage);
router.post('/my-properties/:id/gallery', tenantOnly, upload_middleware_1.default.array('galleryImages', 10), property_controller_1.PropertyController.uploadGallery);
router.get('/nearby', property_controller_1.PropertyController.getNearbyProperties);
exports.default = router;
