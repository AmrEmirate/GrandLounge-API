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
const prisma_1 = require("../config/prisma");
class RoomRepository {
    create(propertyId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma_1.prisma.room.create({
                data: Object.assign({ propertyId: propertyId }, data),
            });
        });
    }
    findAllByPropertyId(propertyId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma_1.prisma.room.findMany({
                where: { propertyId: propertyId, deletedAt: null },
            });
        });
    }
    findById(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma_1.prisma.room.findFirst({
                where: { id: roomId, deletedAt: null },
            });
        });
    }
    update(roomId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma_1.prisma.room.update({
                where: { id: roomId },
                data: data,
            });
        });
    }
    delete(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma_1.prisma.room.update({
                where: { id: roomId },
                data: { deletedAt: new Date() },
            });
        });
    }
}
exports.default = new RoomRepository();
