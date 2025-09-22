import { PropertyRepository } from '../repositories/property.repository';
import { Property } from '../../prisma/generated/prisma';
import { uploadToCloudinary } from '../utils/cloudinary';
import { Express } from 'express';
import { prisma } from '../config/prisma';

const _uploadMainImage = async (files: { [fieldname: string]: Express.Multer.File[] }) => {
    if (files.mainImage && files.mainImage[0]) {
        const result = await uploadToCloudinary(files.mainImage[0].buffer, 'property_images');
        return result.secure_url;
    }
    return undefined;
};

const _uploadGalleryImages = async (files: { [fieldname: string]: Express.Multer.File[] }) => {
    if (files.galleryImages && files.galleryImages.length > 0) {
        const uploadPromises = files.galleryImages.map(file =>
            uploadToCloudinary(file.buffer, 'property_gallery')
        );
        const galleryResults = await Promise.all(uploadPromises);
        return galleryResults.map(result => result.secure_url);
    }
    return [];
};

const _handleDeletedImages = async (deletedImageIds: string | string[] | undefined, propertyId: string) => {
    if (deletedImageIds) {
        const idsToDelete = Array.isArray(deletedImageIds) ? deletedImageIds : [deletedImageIds];
        if (idsToDelete.length > 0) {
            await prisma.propertyImage.deleteMany({
                where: { id: { in: idsToDelete }, propertyId: propertyId },
            });
        }
    }
};

export const TenantPropertyService = {
    createProperty: async (
        data: any,
        tenantId: string,
        files: { [fieldname: string]: Express.Multer.File[] }
    ): Promise<Property> => {
        const { name, categoryId, description, address, zipCode, amenityIds, cityId, latitude, longitude } = data;
        
        const mainImageUrl = await _uploadMainImage(files);
        const galleryImageUrls = await _uploadGalleryImages(files);

        const propertyData = { 
            name, 
            description, 
            address,
            zipCode, 
            mainImage: mainImageUrl,
            latitude: latitude ? parseFloat(latitude) : undefined,
            longitude: longitude ? parseFloat(longitude) : undefined,
        };

        const amenityIdsArray = Array.isArray(amenityIds) ? amenityIds : (amenityIds ? [amenityIds] : []);

        const newProperty = await PropertyRepository.create(
            propertyData, tenantId, categoryId, cityId, amenityIdsArray
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
        await TenantPropertyService.getPropertyDetailForTenant(id, tenantId);
        
        const { amenityIds, deletedImageIds, latitude, longitude, ...propertyData } = data;

        if (files) {
            propertyData.mainImage = await _uploadMainImage(files) ?? propertyData.mainImage;
            const newImageUrls = await _uploadGalleryImages(files);
            if (newImageUrls.length > 0) {
                await PropertyRepository.addGalleryImages(id, newImageUrls);
            }
        }

        if (latitude) {
            propertyData.latitude = parseFloat(latitude);
        }
        if (longitude) {
            propertyData.longitude = parseFloat(longitude);
        }

        await _handleDeletedImages(deletedImageIds, id);
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
        const imageUrls = await _uploadGalleryImages({ galleryImages: files });
        return await PropertyRepository.addGalleryImages(id, imageUrls);
    },
};