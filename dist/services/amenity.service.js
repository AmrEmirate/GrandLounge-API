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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AmenityService = void 0;
const amenity_repository_1 = require("../repositories/amenity.repository");
const prisma_1 = require("../config/prisma");
exports.AmenityService = {
    createAmenity: (name) => __awaiter(void 0, void 0, void 0, function* () {
        const existingAmenity = yield prisma_1.prisma.amenity.findUnique({ where: { name } });
        if (existingAmenity) {
            throw new Error('Nama fasilitas sudah ada.');
        }
        return yield amenity_repository_1.AmenityRepository.create(name);
    }),
    getAllAmenities: () => __awaiter(void 0, void 0, void 0, function* () {
        return yield amenity_repository_1.AmenityRepository.findAll();
    }),
    updateAmenity: (id, name) => __awaiter(void 0, void 0, void 0, function* () {
        const amenity = yield amenity_repository_1.AmenityRepository.findById(id);
        if (!amenity) {
            throw new Error('Fasilitas tidak ditemukan.');
        }
        return yield amenity_repository_1.AmenityRepository.update(id, name);
    }),
    deleteAmenity: (id) => __awaiter(void 0, void 0, void 0, function* () {
        const amenity = yield amenity_repository_1.AmenityRepository.findById(id);
        if (!amenity) {
            throw new Error('Fasilitas tidak ditemukan.');
        }
        return yield amenity_repository_1.AmenityRepository.delete(id);
    }),
};
