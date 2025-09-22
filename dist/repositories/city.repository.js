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
exports.CityRepository = void 0;
const prisma_1 = require("../config/prisma");
exports.CityRepository = {
    create: (data) => __awaiter(void 0, void 0, void 0, function* () {
        return yield prisma_1.prisma.city.create({
            data: data,
        });
    }),
    findAll: () => __awaiter(void 0, void 0, void 0, function* () {
        return yield prisma_1.prisma.city.findMany({
            where: { deletedAt: null }, // Filter data aktif
        });
    }),
    findById: (id) => __awaiter(void 0, void 0, void 0, function* () {
        return yield prisma_1.prisma.city.findFirst({
            where: { id, deletedAt: null }, // Filter data aktif
        });
    }),
    update: (id, data) => __awaiter(void 0, void 0, void 0, function* () {
        return yield prisma_1.prisma.city.update({
            where: { id },
            data: data,
        });
    }),
    // Mengubah delete menjadi softDelete
    delete: (id) => __awaiter(void 0, void 0, void 0, function* () {
        return yield prisma_1.prisma.city.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }),
};
