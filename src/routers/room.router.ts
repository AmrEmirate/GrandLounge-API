import { Router } from 'express';
import { RoomController } from '../controllers/room.controller';
import upload from '../middleware/upload.middleware';
import roomAvailabilityRouter from './roomAvailability.router';

const router = Router({ mergeParams: true });

router.post('/', RoomController.create);
router.get('/', RoomController.getAllByProperty);
router.get('/:roomId', RoomController.getById);
router.patch('/:roomId', RoomController.update);
router.delete('/:roomId', RoomController.delete);
router.use('/:roomId/availability', roomAvailabilityRouter);

router.post(
    '/:roomId/gallery',
    upload.array('roomGalleryImages', 5),
    RoomController.uploadGallery
);

export default router;