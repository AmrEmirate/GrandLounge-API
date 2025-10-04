"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantPropertyService = void 0;
const property_repository_1 = require("../repositories/property.repository");
const cloudinary_1 = require("../utils/cloudinary");
const prisma_1 = require("../config/prisma");
const _uploadMainImage = (files) => __awaiter(void 0, void 0, void 0, function* () {
    if (files.mainImage && files.mainImage[0]) {
        const result = yield (0, cloudinary_1.uploadToCloudinary)(files.mainImage[0].buffer, 'property_images');
        return result.secure_url;
    }
    return undefined;
});
const _uploadGalleryImages = (files) => __awaiter(void 0, void 0, void 0, function* () {
    if (files.galleryImages && files.galleryImages.length > 0) {
        const uploadPromises = files.galleryImages.map(file => (0, cloudinary_1.uploadToCloudinary)(file.buffer, 'property_gallery'));
        const galleryResults = yield Promise.all(uploadPromises);
        return galleryResults.map(result => result.secure_url);
    }
    return [];
});
const _handleDeletedImages = (deletedImageIds, propertyId) => __awaiter(void 0, void 0, void 0, function* () {
    if (deletedImageIds) {
        const idsToDelete = Array.isArray(deletedImageIds) ? deletedImageIds : [deletedImageIds];
        if (idsToDelete.length > 0) {
            yield prisma_1.prisma.propertyImage.deleteMany({
                where: { id: { in: idsToDelete }, propertyId: propertyId },
            });
        }
    }
});
exports.TenantPropertyService = {
    createProperty: (data, tenantId, files) => __awaiter(void 0, void 0, void 0, function* () {
        const { name, categoryId, description, address, zipCode, amenityIds, cityId, latitude, longitude } = data;
        const mainImageUrl = yield _uploadMainImage(files);
        const galleryImageUrls = yield _uploadGalleryImages(files);
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
        const newProperty = yield property_repository_1.PropertyRepository.create(propertyData, tenantId, categoryId, cityId, amenityIdsArray);
        if (galleryImageUrls.length > 0) {
            yield property_repository_1.PropertyRepository.addGalleryImages(newProperty.id, galleryImageUrls);
        }
        return newProperty;
    }),
    getPropertiesByTenant: (tenantId) => __awaiter(void 0, void 0, void 0, function* () {
        return yield property_repository_1.PropertyRepository.findAllByTenantId(tenantId);
    }),
    getPropertyDetailForTenant: (id, tenantId) => __awaiter(void 0, void 0, void 0, function* () {
        const property = yield property_repository_1.PropertyRepository.findByIdAndTenantId(id, tenantId);
        if (!property) {
            throw new Error('Properti tidak ditemukan atau Anda tidak memiliki akses.');
        }
        return property;
    }),
    updateProperty: (id, tenantId, data, files) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        yield exports.TenantPropertyService.getPropertyDetailForTenant(id, tenantId);
        const { amenityIds, deletedImageIds, latitude, longitude, address } = data, propertyData = __rest(data, ["amenityIds", "deletedImageIds", "latitude", "longitude", "address"]);
        propertyData.address = address;
        if (files) {
            propertyData.mainImage = (_a = yield _uploadMainImage(files)) !== null && _a !== void 0 ? _a : propertyData.mainImage;
            const newImageUrls = yield _uploadGalleryImages(files);
            if (newImageUrls.length > 0) {
                yield property_repository_1.PropertyRepository.addGalleryImages(id, newImageUrls);
            }
        }
        if (latitude) {
            propertyData.latitude = parseFloat(latitude);
        }
        if (longitude) {
            propertyData.longitude = parseFloat(longitude);
        }
        yield _handleDeletedImages(deletedImageIds, id);
        const amenityIdsArray = Array.isArray(amenityIds) ? amenityIds : (amenityIds ? [amenityIds] : []);
        return yield property_repository_1.PropertyRepository.update(id, propertyData, amenityIdsArray);
    }),
    deleteProperty: (id, tenantId) => __awaiter(void 0, void 0, void 0, function* () {
        yield exports.TenantPropertyService.getPropertyDetailForTenant(id, tenantId);
        return yield property_repository_1.PropertyRepository.softDelete(id);
    }),
    uploadPropertyImage: (id, tenantId, file) => __awaiter(void 0, void 0, void 0, function* () {
        yield exports.TenantPropertyService.getPropertyDetailForTenant(id, tenantId);
        const result = yield (0, cloudinary_1.uploadToCloudinary)(file.buffer, 'property_images');
        return yield property_repository_1.PropertyRepository.update(id, { mainImage: result.secure_url });
    }),
    uploadGalleryImages: (id, tenantId, files) => __awaiter(void 0, void 0, void 0, function* () {
        yield exports.TenantPropertyService.getPropertyDetailForTenant(id, tenantId);
        const imageUrls = yield _uploadGalleryImages({ galleryImages: files });
        return yield property_repository_1.PropertyRepository.addGalleryImages(id, imageUrls);
    }),
};
