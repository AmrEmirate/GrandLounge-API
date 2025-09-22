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
exports.PropertyRepository = void 0;
const prisma_1 = require("../config/prisma");
exports.PropertyRepository = {
    create: (propertyData, tenantId, categoryId, cityId, amenityIds) => __awaiter(void 0, void 0, void 0, function* () {
        return yield prisma_1.prisma.property.create({
            data: Object.assign(Object.assign({}, propertyData), { mainImage: propertyData.mainImage || null, tenant: {
                    connect: { id: tenantId },
                }, city: {
                    connect: { id: cityId },
                }, category: {
                    connect: { id: categoryId },
                }, amenities: {
                    connect: (amenityIds === null || amenityIds === void 0 ? void 0 : amenityIds.map((id) => ({ id }))) || [],
                } }),
        });
    }),
    findAllByTenantId: (tenantId) => __awaiter(void 0, void 0, void 0, function* () {
        return yield prisma_1.prisma.property.findMany({
            where: { tenantId: tenantId, deletedAt: null },
            include: {
                category: true,
                city: true,
                amenities: true,
                rooms: true,
            },
        });
    }),
    findByIdAndTenantId: (id, tenantId) => __awaiter(void 0, void 0, void 0, function* () {
        return yield prisma_1.prisma.property.findFirst({
            where: { id: id, tenantId: tenantId, deletedAt: null },
            include: {
                category: true,
                city: true,
                amenities: true,
                rooms: true,
                images: true,
            },
        });
    }),
    findPublicById: (id) => __awaiter(void 0, void 0, void 0, function* () {
        return yield prisma_1.prisma.property.findFirst({
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
                        createdAt: true, // <-- TAMBAHKAN BARIS INI
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
    }),
    update: (id, data, amenityIds) => __awaiter(void 0, void 0, void 0, function* () {
        const { cityId, categoryId } = data, propertyData = __rest(data, ["cityId", "categoryId"]);
        return yield prisma_1.prisma.property.update({
            where: { id: id },
            data: Object.assign(Object.assign({}, propertyData), { city: cityId ? { connect: { id: cityId } } : undefined, category: categoryId ? { connect: { id: categoryId } } : undefined, amenities: amenityIds ? { set: amenityIds.map((id) => ({ id })) } : undefined }),
        });
    }),
    softDelete: (id) => __awaiter(void 0, void 0, void 0, function* () {
        return yield prisma_1.prisma.property.update({
            where: { id: id },
            data: {
                deletedAt: new Date(),
            },
        });
    }),
    addGalleryImages: (propertyId, imageUrls) => __awaiter(void 0, void 0, void 0, function* () {
        const imageData = imageUrls.map(url => ({
            propertyId: propertyId,
            imageUrl: url,
        }));
        yield prisma_1.prisma.propertyImage.createMany({
            data: imageData,
        });
        return prisma_1.prisma.property.findUnique({
            where: { id: propertyId },
            include: { images: true }
        });
    }),
};
