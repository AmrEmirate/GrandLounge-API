import prisma from '../configs/db';
import { Prisma } from '@prisma/client';
interface SearchParams {
  page?: number;
  limit?: number;
  city?: string;
  name?: string;
  categoryId?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: 'name' | 'price';
  sortOrder?: 'asc' | 'desc';
}

export const searchProperties = async (params: SearchParams) => {
  const {
    page = 1,
    limit = 10,
    city,
    name,
    categoryId,
    startDate,
    endDate,
    sortBy = 'name',
    sortOrder = 'asc',
  } = params;

  const skip = (page - 1) * limit;

  const where: Prisma.PropertyWhereInput = {};
  if (city) where.city = { contains: city, mode: 'insensitive' };
  if (name) where.name = { contains: name, mode: 'insensitive' };
  if (categoryId) where.categoryId = categoryId;
  if (startDate && endDate) {
    where.rooms = {
      some: {
        availabilities: {
          none: {
            date: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
            status: 'UNAVAILABLE',
          },
        },
      },
    };
  }
  
  const orderBy: any = {};
  if (sortBy === 'name') {
    orderBy.name = sortOrder;
  } else if (sortBy === 'price') {
    orderBy.rooms = {
      _count: sortOrder, 
    };
  }

  const properties = await prisma.property.findMany({
    where,
    skip,
    take: limit,
    orderBy,
    include: {
      category: true,
      rooms: {
        orderBy: {
            basePrice: 'asc' 
        }
      },
    },
  });

  const propertiesWithMinPrice = properties.map(property => {
    const minPrice = property.rooms && property.rooms.length > 0 ? property.rooms[0].basePrice : null;
    return { ...property, minPrice };
  });

  const totalProperties = await prisma.property.count({ where });

  return {
    properties: propertiesWithMinPrice,
    total: totalProperties,
    page,
    limit,
  };
};

export const getAvailableCities = async (): Promise<string[]> => {
  const distinctCities = await prisma.property.findMany({
    select: {
      city: true,
    },
    distinct: ['city'],
  });

  return distinctCities.map((p) => p.city);
};