import { Router } from 'express';
import { getPublicProperties, getCityList } from '../controllers/propertyController';

const router = Router();

router.get('/cities', getCityList);
router.get('/', getPublicProperties);

export default router;