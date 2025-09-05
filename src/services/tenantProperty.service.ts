import { PropertyRepository } from '../repositories/property.repository';
import { Property } from '../generated/prisma';
import { uploadToCloudinary } from '../utils/cloudinary';
import { Express } from 'express';
import { prisma } from '../config/prisma'; // Pastikan prisma diimpor

export const TenantPropertyService = {
  createProperty: async (
    data: any, 
    tenantId: string, 
    files: { [fieldname: string]: Express.Multer.File[] }
  ): Promise<Property> => {
    const { name, categoryId, description, zipCode, amenityIds, cityId } = data;
    
    let mainImageUrl: string | undefined = undefined;
    let galleryImageUrls: string[] = [];

    if (files.mainImage && files.mainImage[0]) {
      const mainImageFile = files.mainImage[0];
      const result = await uploadToCloudinary(mainImageFile.buffer, 'property_images');
      mainImageUrl = result.secure_url;
    }

    if (files.galleryImages && files.galleryImages.length > 0) {
      const galleryUploadPromises = files.galleryImages.map(file => 
        uploadToCloudinary(file.buffer, 'property_gallery')
      );
      const galleryResults = await Promise.all(galleryUploadPromises);
      galleryImageUrls = galleryResults.map(result => result.secure_url);
    }
    
    const propertyData = {
      name,
      description,
      zipCode,
      mainImage: mainImageUrl,
    };
    
    const amenityIdsArray = Array.isArray(amenityIds) ? amenityIds : (amenityIds ? [amenityIds] : []);

    const newProperty = await PropertyRepository.create(
      propertyData, 
      tenantId, 
      categoryId,
      cityId,
      amenityIdsArray
    );

    if (galleryImageUrls.length > 0) {
      await PropertyRepository.addGalleryImages(newProperty.id, galleryImageUrls);
    }

    return newProperty;
  },

  getPropertiesByTenant: async (tenantId: string): Promise<Property[]> => {
    return await PropertyRepository.findAllByTenantId(tenantId);
  },

  getPropertyDetailForTenant: async (id: string, tenantId: string): Promise<Property> => {
    const property = await PropertyRepository.findByIdAndTenantId(id, tenantId);
    if (!property) {
      throw new Error('Properti tidak ditemukan atau Anda tidak memiliki akses.');
    }
    return property;
  },

  updateProperty: async (
    id: string, 
    tenantId: string, 
    data: any, 
    files?: { [fieldname: string]: Express.Multer.File[] }
  ): Promise<Property> => {
    // 1. Verifikasi bahwa properti ada dan dimiliki oleh tenant
    await TenantPropertyService.getPropertyDetailForTenant(id, tenantId);

    const { amenityIds, deletedImageIds, ...propertyData } = data;

    // 2. Handle upload gambar utama baru jika ada
    if (files && files.mainImage && files.mainImage[0]) {
      const result = await uploadToCloudinary(files.mainImage[0].buffer, 'property_images');
      propertyData.mainImage = result.secure_url;
    }

    // 3. Handle penghapusan gambar galeri lama
    if (deletedImageIds) {
      const idsToDelete = Array.isArray(deletedImageIds) ? deletedImageIds : [deletedImageIds];
      if (idsToDelete.length > 0) {
        await prisma.propertyImage.deleteMany({
          where: { 
            id: { in: idsToDelete },
            propertyId: id // Pastikan hanya menghapus gambar dari properti ini
          },
        });
      }
    }

    // 4. Handle upload gambar galeri baru
    if (files && files.galleryImages && files.galleryImages.length > 0) {
      const uploadPromises = files.galleryImages.map(file =>
        uploadToCloudinary(file.buffer, 'property_gallery')
      );
      const galleryResults = await Promise.all(uploadPromises);
      const newImageUrls = galleryResults.map(result => result.secure_url);
      await PropertyRepository.addGalleryImages(id, newImageUrls);
    }
    
    // 5. Update data properti (nama, deskripsi, dll) dan fasilitas
    const amenityIdsArray = Array.isArray(amenityIds) ? amenityIds : (amenityIds ? [amenityIds] : []);
    
    return await PropertyRepository.update(id, propertyData, amenityIdsArray);
  },

  deleteProperty: async (id: string, tenantId: string): Promise<Property> => {
    await TenantPropertyService.getPropertyDetailForTenant(id, tenantId);
    return await PropertyRepository.softDelete(id);
  },
  
  uploadPropertyImage: async (id: string, tenantId: string, file: Express.Multer.File): Promise<Property> => {
    await TenantPropertyService.getPropertyDetailForTenant(id, tenantId);
    const result = await uploadToCloudinary(file.buffer, 'property_images');
    return await PropertyRepository.update(id, { mainImage: result.secure_url });
  },

  uploadGalleryImages: async (id: string, tenantId: string, files: Express.Multer.File[]) => {
    await TenantPropertyService.getPropertyDetailForTenant(id, tenantId);
    const uploadPromises = files.map(file => 
        uploadToCloudinary(file.buffer, 'property_gallery')
    );
    const uploadResults = await Promise.all(uploadPromises);
    const imageUrls = uploadResults.map(result => result.secure_url);
    
    return await PropertyRepository.addGalleryImages(id, imageUrls);
  },
};