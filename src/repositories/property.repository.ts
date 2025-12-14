import { prisma } from "../config/prisma";
import { Property } from "@prisma/client";

class PropertyRepository {
  async create(
    propertyData: any,
    tenantId: string,
    categoryId: string,
    cityId: string,
    amenityIds?: string[]
  ): Promise<Property> {
    return await prisma.property.create({
      data: {
        ...propertyData,
        mainImage: propertyData.mainImage || null,
        tenant: {
          connect: { id: tenantId },
        },
        city: {
          connect: { id: cityId },
        },
        category: {
          connect: { id: categoryId },
        },
        amenities: {
          connect: amenityIds?.map((id) => ({ id })) || [],
        },
      },
    });
  }

  async findAllByTenantId(tenantId: string): Promise<Property[]> {
    return await prisma.property.findMany({
      where: { tenantId: tenantId, deletedAt: null },
      include: {
        category: true,
        city: true,
        amenities: true,
        rooms: true,
      },
    });
  }

  async findByIdAndTenantId(
    id: string,
    tenantId: string
  ): Promise<Property | null> {
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
  }

  async findPublicById(id: string): Promise<Property | null> {
    return await prisma.property.findFirst({
      where: { id: id, deletedAt: null },
      include: {
        category: true,
        city: true,
        amenities: true,
        images: true,
        rooms: {
          where: { deletedAt: null },
        },
        tenant: {
          select: {
            createdAt: true,
            user: {
              select: {
                fullName: true,
                profilePicture: true,
              },
            },
          },
        },
      },
    });
  }

  async update(
    id: string,
    data: any,
    amenityIds?: string[]
  ): Promise<Property> {
    const { cityId, categoryId, ...propertyData } = data;

    return await prisma.property.update({
      where: { id: id },
      data: {
        ...propertyData,
        city: cityId ? { connect: { id: cityId } } : undefined,
        category: categoryId ? { connect: { id: categoryId } } : undefined,
        amenities: amenityIds
          ? { set: amenityIds.map((id) => ({ id })) }
          : undefined,
      },
    });
  }

  async softDelete(id: string): Promise<Property> {
    return await prisma.property.update({
      where: { id: id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async addGalleryImages(propertyId: string, imageUrls: string[]) {
    const imageData = imageUrls.map((url) => ({
      propertyId: propertyId,
      imageUrl: url,
    }));

    await prisma.propertyImage.createMany({
      data: imageData,
    });

    return prisma.property.findUnique({
      where: { id: propertyId },
      include: { images: true },
    });
  }
}

export default new PropertyRepository();
