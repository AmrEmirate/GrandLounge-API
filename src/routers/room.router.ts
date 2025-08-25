import { Router } from 'express';
import { RoomController } from '../controllers/room.controller';

const router = Router({ mergeParams: true });

router.post('/', RoomController.create);
router.get('/', RoomController.getAllByProperty);
router.patch('/:roomId', RoomController.update);
router.delete('/:roomId', RoomController.delete);

export default router;