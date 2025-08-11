import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  
  const userId = req.account?.id;
  console.log(`User dengan ID: ${userId} sedang membuat pesanan.`);

  res.status(201).json({ success: true, message: 'Order created successfully!' });
});