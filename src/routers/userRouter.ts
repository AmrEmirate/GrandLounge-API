import { Router } from 'express';
import { getUserProfile, updateUserProfile, updateUserPicture } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = Router();

router.use(protect);

router.get('/profile', getUserProfile);
router.patch('/profile', updateUserProfile);
router.patch('/profile/picture', upload.single('profilePic'), updateUserPicture);

export default router;