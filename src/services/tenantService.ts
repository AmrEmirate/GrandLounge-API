import { PropertyCategory } from '@prisma/client';
import prisma from '../config/db';
import ApiError from '../utils/apiError';

export const createCategory = async (name: string): Promise<PropertyCategory> => {
  const existingCategory = await prisma.propertyCategory.findUnique({ where: { name } });
  if (existingCategory) {
    throw new ApiError(400, 'Category with this name already exists');
  }

  return prisma.propertyCategory.create({
    data: { name },
  });
};

export const getAllCategories = async (): Promise<PropertyCategory[]> => {
  return prisma.propertyCategory.findMany();
};

export const updateCategory = async (id: number, name: string): Promise<PropertyCategory> => {
  return prisma.propertyCategory.update({
    where: { id },
    data: { name },
  });
};

export const deleteCategory = async (id: number): Promise<PropertyCategory> => {
  return prisma.propertyCategory.delete({
    where: { id },
  });
};