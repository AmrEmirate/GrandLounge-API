import { Request, Response } from 'express';
import * as tenantService from '../services/tenantService';
import asyncHandler from '../utils/asyncHandler';

export const createPropertyCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body;
  const category = await tenantService.createCategory(name);
  res.status(201).json({ success: true, data: category });
});

export const getPropertyCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await tenantService.getAllCategories();
  res.status(200).json({ success: true, data: categories });
});

export const updatePropertyCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;
  const category = await tenantService.updateCategory(Number(id), name);
  res.status(200).json({ success: true, data: category });
});

export const deletePropertyCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await tenantService.deleteCategory(Number(id));
  res.status(200).json({ success: true, message: 'Category deleted successfully' });
});