import { Router } from 'express';
import { createOrder } from '../controllers/transactionController';
import { protect, isVerified } from '../middleware/authMiddleware'; 

const router = Router();

router.post('/orders', protect, isVerified, createOrder);

export default router;