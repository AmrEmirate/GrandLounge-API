import { Router } from 'express';
import authRouter from './authRouter';
import userRouter from './userRouter';
import tenantRouter from './tenantRouter'; 
import transactionRouter from './transactionRouter';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/tenants', tenantRouter); 
router.use('/transactions', transactionRouter); 

export default router;