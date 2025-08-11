import { Prisma } from '@prisma/client';
import prisma from '../configs/db';

// --- Category ---
export const findCategoryByName = (name: string) => {
  return prisma.propertyCategory.findUnique({ where: { name } });
};

export const createCategory = (name: string) => {
  return prisma.propertyCategory.create({ data: { name } });
};

export const findAllCategories = () => {
  return prisma.propertyCategory.findMany();
};

export const updateCategoryById = (id: number, name: string) => {
  return prisma.propertyCategory.update({ where: { id }, data: { name } });
};

export const deleteCategoryById = (id: number) => {
  return prisma.propertyCategory.delete({ where: { id } });
};


// --- Property ---
export const createProperty = (data: Prisma.PropertyCreateInput) => {
    return prisma.property.create({ data });
};

export const findPropertiesByTenantId = (tenantId: string) => {
    return prisma.property.findMany({
        where: { tenantId },
        include: { category: true, rooms: true },
    });
};

export const findPropertyById = (id: number) => {
    return prisma.property.findUnique({ where: { id } });
};

export const updatePropertyById = (id: number, data: Prisma.PropertyUpdateInput) => {
    return prisma.property.update({ where: { id }, data });
};

export const deletePropertyById = (id: number) => {
    return prisma.property.delete({ where: { id } });
};

export const findProperties = (args: { where: Prisma.PropertyWhereInput, skip: number, take: number, orderBy: any, include: any }) => {
    return prisma.property.findMany(args);
};

export const countProperties = (where: Prisma.PropertyWhereInput) => {
    return prisma.property.count({ where });
};

export const findDistinctCities = () => {
    return prisma.property.findMany({
        select: { city: true },
        distinct: ['city'],
    });
};