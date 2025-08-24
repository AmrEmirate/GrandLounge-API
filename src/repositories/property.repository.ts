import { prisma } from '../config/prisma';
import { Property } from '../generated/prisma';

export const PropertyRepository = {
  create: async (data: any, tenantId: number, amenityIds?: number[]): Promise<Property> => {
    return await prisma.property.create({
      data: {
        ...data,
        tenantId: tenantId,
        amenities: {
          connect: amenityIds?.map((id) => ({ id })) || [],
        },
      },
      include: {
        amenities: true,
        category: true,
      },
    });
  },

  findAllByTenantId: async (tenantId: number): Promise<Property[]> => {
    return await prisma.property.findMany({
      where: { tenantId: tenantId, deletedAt: null },
      include: {
        category: true,
        amenities: true,
        city: true,
      },
    });
  },

  findByIdAndTenantId: async (id: number, tenantId: number): Promise<Property | null> => {
    return await prisma.property.findFirst({
      where: { id: id, tenantId: tenantId, deletedAt: null },
      include: {
        category: true,
        amenities: true,
        rooms: true,
        city: true,
      },
    });
  },

  update: async (id: number, data: any, amenityIds?: number[]): Promise<Property> => {
    const updatePayload: any = { ...data };

    if (amenityIds) {
      updatePayload.amenities = {
        set: amenityIds.map((id) => ({ id })),
      };
    }

    return await prisma.property.update({
      where: { id: id },
      data: updatePayload,
      include: {
        amenities: true,
        category: true,
      },
    });
  },

  softDelete: async (id: number): Promise<Property> => {
    return await prisma.property.update({
      where: { id: id },
      data: {
        deletedAt: new Date(),
      },
    });
  },
};