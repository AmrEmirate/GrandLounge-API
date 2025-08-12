import { Router } from 'express';
import authRouter from './authRouter';
import userRouter from './userRouter';
import tenantRouter from './tenantRouter'; 
import transactionRouter from './transactionRouter';
import propertyRouter from './propertyRouter';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/tenants', tenantRouter); 
router.use('/transactions', transactionRouter); 
router.use('/properties', propertyRouter);

export default router;