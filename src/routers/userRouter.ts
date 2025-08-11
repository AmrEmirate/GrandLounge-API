import { Router } from 'express';
import { getUserProfile, updateUserProfile, updateUserPicture } from '../controllers/userController';
import { protect } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/uploadMiddleware';

const router = Router();

router.use(protect);

router.get('/profile', getUserProfile);
router.patch('/profile', updateUserProfile);
router.patch('/profile/picture', upload.single('profilePic'), updateUserPicture);

export default router;