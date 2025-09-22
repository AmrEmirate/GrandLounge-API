// src/routers/city.router.ts
import { Router } from 'express';
import { CityController } from '../controllers/city.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { UserRole } from '../../prisma/generated/client';

const router = Router();

const allAuthenticated = authMiddleware(); // Middleware untuk semua yang sudah login
const tenantOnly = authMiddleware([UserRole.TENANT]); // Middleware khusus tenant

// Endpoint publik untuk mengambil semua kota
router.get('/', CityController.getAll);

// Endpoint terproteksi hanya untuk tenant
router.post('/', tenantOnly, CityController.create);
router.patch('/:id', tenantOnly, CityController.update);
router.delete('/:id', tenantOnly, CityController.delete);

export default router;