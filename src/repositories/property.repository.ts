import { prisma } from '../config/prisma';
import { Property } from '../generated/prisma';

export const PropertyRepository = {
  // --- PERBAIKAN KUNCI DI SINI ---
  create: async (
    propertyData: any, 
    tenantId: string, 
    categoryId: string, 
    cityId: string, 
    amenityIds?: string[]
  ): Promise<Property> => {
    return await prisma.property.create({
      data: {
        ...propertyData,
        mainImage: propertyData.mainImage || null,
        tenant: {
          connect: { id: tenantId },
        },
        city: {
          connect: { id: cityId }, // Gunakan cityId dari argumen
        },
        category: {
          connect: { id: categoryId }, // Gunakan categoryId dari argumen
        },
        amenities: {
          connect: amenityIds?.map((id) => ({ id })) || [],
        },
      },
    });
  },
  // --- AKHIR PERBAIKAN ---

  findAllByTenantId: async (tenantId: string): Promise<Property[]> => {
    return await prisma.property.findMany({
      where: { tenantId: tenantId, deletedAt: null },
      include: {
        category: true,
        city: true,
        amenities: true,
        rooms: true,
      },
    });
  },

  findByIdAndTenantId: async (id: string, tenantId: string): Promise<Property | null> => {
    return await prisma.property.findFirst({
      where: { id: id, tenantId: tenantId, deletedAt: null },
      include: {
        category: true,
        city: true,
        amenities: true,
        rooms: true,
        images: true,
      },
    });
  },

  update: async (id: string, data: any, amenityIds?: string[]): Promise<Property> => {
    const { cityId, categoryId, ...propertyData } = data;

    return await prisma.property.update({
      where: { id: id },
      data: {
        ...propertyData,
        city: cityId ? { connect: { id: cityId } } : undefined,
        category: categoryId ? { connect: { id: categoryId } } : undefined,
        amenities: amenityIds ? { set: amenityIds.map((id) => ({ id })) } : undefined,
      },
    });
  },

  softDelete: async (id: string): Promise<Property> => {
    return await prisma.property.update({
      where: { id: id },
      data: {
        deletedAt: new Date(),
      },
    });
  },

  addGalleryImages: async (propertyId: string, imageUrls: string[]) => {
    const imageData = imageUrls.map(url => ({
      propertyId: propertyId,
      imageUrl: url,
    }));

    await prisma.propertyImage.createMany({
      data: imageData,
    });

    return prisma.property.findUnique({
      where: { id: propertyId },
      include: { images: true }
    });
  },
};