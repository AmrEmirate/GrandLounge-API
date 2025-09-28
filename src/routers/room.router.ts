// src/routers/room.router.ts

import { Router } from 'express';
import RoomController from '../controllers/room.controller';
import roomAvailabilityRouter from './roomAvailability.router';
import { authMiddleware } from '../middleware/auth.middleware';
import { UserRole } from '../../prisma/generated/client';

const router = Router({ mergeParams: true });
const tenantOnly = authMiddleware([UserRole.TENANT]);

router.get(
  '/:roomId/availability-by-month',
  tenantOnly,
  RoomController.getMonthlyAvailability
);

router.post('/', tenantOnly, RoomController.create);
router.get('/', tenantOnly, RoomController.getAllByProperty);
router.get('/:roomId', tenantOnly, RoomController.getById);
router.patch('/:roomId', tenantOnly, RoomController.update);
router.delete('/:roomId', tenantOnly, RoomController.delete);

router.use('/:roomId/availability', roomAvailabilityRouter);

export default router;