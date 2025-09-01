import { Router } from 'express';
import authRouter from './auth.router';
import propertyRouter from './property.router';
import userRouter from './user.router';
import categoryRouter from './category.router';
import peakSeasonRouter from './peakSeason.router';

const router = Router();

router.use('/auth', authRouter);
router.use('/properties', propertyRouter);
router.use('/user', userRouter);
router.use('/categories', categoryRouter); 
router.use('/peak-seasons', peakSeasonRouter);

export default router;