import { Request, Response } from 'express';
import * as userService from '../services/userService';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/apiError';

export const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.account) {
    throw new ApiError(401, 'Unauthorized');
  }
  const user = await userService.getProfile(req.account.id);
  res.status(200).json(user);
});

export const updateUserProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.account) {
    throw new ApiError(401, 'Unauthorized');
  }
  const { name, email, password } = req.body;
  const updatedUser = await userService.updateProfile(req.account.id, { name, email, password });
  res.status(200).json(updatedUser);
});

export const updateUserPicture = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ApiError(400, 'No file uploaded');
  }
  if (!req.account) {
    throw new ApiError(401, 'Unauthorized');
  }

  const filePath = `/images/${req.file.filename}`;
  
  const updatedUser = await userService.updateProfilePicture(req.account.id, filePath);
  res.status(200).json({ success: true, data: updatedUser });
});