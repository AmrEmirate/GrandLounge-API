import { PropertyCategory } from '@prisma/client';

import prisma from '../config/db';

import ApiError from '../utils/apiError';
import * as propertyRepo from '../repositories/propertyRepository';

// --- Category ---
export const createCategory = async (name: string): Promise<PropertyCategory> => {
  const existingCategory = await propertyRepo.findCategoryByName(name);
  if (existingCategory) {
    throw new ApiError(400, 'Category with this name already exists');
  }
  return propertyRepo.createCategory(name);
};

export const getAllCategories = (): Promise<PropertyCategory[]> => {
  return propertyRepo.findAllCategories();
};

export const updateCategory = (id: number, name: string): Promise<PropertyCategory> => {
  return propertyRepo.updateCategoryById(id, name);
};

export const deleteCategory = (id: number): Promise<PropertyCategory> => {
  return propertyRepo.deleteCategoryById(id);
};

// --- Property ---
interface PropertyData {
  name: string;
  description: string;
  city: string;
  categoryId: number;
}

export const createProperty = async (tenantId: string, data: PropertyData, filePath: string) => {
  return propertyRepo.createProperty({
    ...data,
    picture: filePath,
    tenant: { connect: { id: tenantId } },
    category: { connect: { id: data.categoryId } },
  });
};

export const getPropertiesByTenant = (tenantId: string) => {
  return propertyRepo.findPropertiesByTenantId(tenantId);
};

export const updateProperty = async (propertyId: number, tenantId: string, data: Partial<PropertyData>, filePath?: string) => {
  const property = await propertyRepo.findPropertyById(propertyId);
  if (!property || property.tenantId !== tenantId) {
    throw new ApiError(404, 'Property not found or you do not have permission to edit it');
  }
  
  const updateData: any = { ...data };
  if (filePath) {
    updateData.picture = filePath;
  }

  return propertyRepo.updatePropertyById(propertyId, updateData);
};

export const deleteProperty = async (propertyId: number, tenantId: string) => {
    const property = await propertyRepo.findPropertyById(propertyId);
    if (!property || property.tenantId !== tenantId) {
      throw new ApiError(404, 'Property not found or you do not have permission to delete it');
    }
    return propertyRepo.deletePropertyById(propertyId);
};