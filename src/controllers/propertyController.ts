import { Request, Response } from 'express';
import * as propertyService from '../services/propertyService';
import asyncHandler from '../utils/asyncHandler';

export const getPublicProperties = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, city, name, categoryId, sortBy, sortOrder, startDate, endDate } = req.query;

  const searchParams = {
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    city: city as string | undefined,
    name: name as string | undefined,
    categoryId: categoryId ? Number(categoryId) : undefined,
    startDate: startDate as string | undefined, 
    endDate: endDate as string | undefined,     
    sortBy: sortBy as 'name' | 'price' | undefined,
    sortOrder: sortOrder as 'asc' | 'desc' | undefined,
  };

  const result = await propertyService.searchProperties(searchParams);
  res.status(200).json({ success: true, ...result });
});

export const getCityList = asyncHandler(async (req: Request, res: Response) => {
  const cities = await propertyService.getAvailableCities();
  res.status(200).json({ success: true, cities });
});