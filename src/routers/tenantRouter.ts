import { Router } from 'express';
import {
  createPropertyCategory,
  getPropertyCategories,
  updatePropertyCategory,
  deletePropertyCategory,
} from '../controllers/tenantController';
import { protect, isTenant } from '../middlewares/authMiddleware';

const router = Router();

router.use(protect, isTenant);

router.post('/categories', createPropertyCategory);
router.get('/categories', getPropertyCategories);
router.patch('/categories/:id', updatePropertyCategory);
router.delete('/categories/:id', deletePropertyCategory);

export default router;