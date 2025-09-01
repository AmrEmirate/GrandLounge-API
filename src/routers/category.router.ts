// src/routers/category.router.ts
import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { UserRole } from '../generated/prisma';

const router = Router();

const allAuthenticated = authMiddleware(); // Middleware untuk semua yang sudah login
const tenantOnly = authMiddleware([UserRole.TENANT]); // Middleware khusus tenant

// Endpoint ini sekarang bisa diakses semua user yang sudah login
// Endpoint ini sekarang bisa diakses oleh publik
router.get('/', CategoryController.getAll);

// Endpoint ini tetap hanya untuk tenant
router.post('/', tenantOnly, CategoryController.create);
router.get('/:id', tenantOnly, CategoryController.getById);
router.patch('/:id', tenantOnly, CategoryController.update);
router.delete('/:id', tenantOnly, CategoryController.delete);

export default router;