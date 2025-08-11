import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import prisma from '../configs/db';
import ApiError from '../utils/apiError';
import asyncHandler from '../utils/asyncHandler';
import { UserRole } from '@prisma/client'; 

export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    throw new ApiError(401, 'Unauthorized, no token');
  }

  const decoded = verifyToken(token);
  const account = await prisma.account.findUnique({
    where: { id: decoded.id },
  });

  if (!account) {
    throw new ApiError(401, 'Unauthorized, user not found');
  }

  req.account = account;
  next();
});

export const isTenant = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (req.account?.role !== UserRole.TENANT) {
    throw new ApiError(403, 'Forbidden, only tenants can access this route');
  }
  next();
});

export const isVerified = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.account?.isVerified) {
    throw new ApiError(403, 'Forbidden, your account is not verified. Please check your email.');
  }
  next();
});