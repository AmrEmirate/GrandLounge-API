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
exports.RoomService = void 0;
const room_repository_1 = require("../repositories/room.repository");
const property_repository_1 = require("../repositories/property.repository");
exports.RoomService = {
    createRoom: (tenantId, propertyId, data) => __awaiter(void 0, void 0, void 0, function* () {
        const property = yield property_repository_1.PropertyRepository.findByIdAndTenantId(propertyId, tenantId);
        if (!property) {
            throw new Error('Properti tidak ditemukan atau Anda tidak memiliki akses.');
        }
        return yield room_repository_1.RoomRepository.create(propertyId, data);
    }),
    getRoomsByProperty: (tenantId, propertyId) => __awaiter(void 0, void 0, void 0, function* () {
        const property = yield property_repository_1.PropertyRepository.findByIdAndTenantId(propertyId, tenantId);
        if (!property) {
            throw new Error('Properti tidak ditemukan atau Anda tidak memiliki akses.');
        }
        return yield room_repository_1.RoomRepository.findAllByPropertyId(propertyId);
    }),
    getRoomById: (tenantId, propertyId, roomId) => __awaiter(void 0, void 0, void 0, function* () {
        const property = yield property_repository_1.PropertyRepository.findByIdAndTenantId(propertyId, tenantId);
        if (!property) {
            throw new Error('Properti tidak ditemukan atau Anda tidak memiliki akses.');
        }
        const room = yield room_repository_1.RoomRepository.findById(roomId);
        if (!room || room.propertyId !== propertyId) {
            return null;
        }
        return room;
    }),
    updateRoom: (tenantId, propertyId, roomId, data) => __awaiter(void 0, void 0, void 0, function* () {
        const property = yield property_repository_1.PropertyRepository.findByIdAndTenantId(propertyId, tenantId);
        if (!property) {
            throw new Error('Properti tidak ditemukan atau Anda tidak memiliki akses.');
        }
        const room = yield room_repository_1.RoomRepository.findById(roomId);
        if (!room || room.propertyId !== propertyId) {
            throw new Error('Kamar tidak ditemukan di properti ini.');
        }
        return yield room_repository_1.RoomRepository.update(roomId, data);
    }),
    deleteRoom: (tenantId, propertyId, roomId) => __awaiter(void 0, void 0, void 0, function* () {
        const property = yield property_repository_1.PropertyRepository.findByIdAndTenantId(propertyId, tenantId);
        if (!property) {
            throw new Error('Properti tidak ditemukan atau Anda tidak memiliki akses.');
        }
        const room = yield room_repository_1.RoomRepository.findById(roomId);
        if (!room || room.propertyId !== propertyId) {
            throw new Error('Kamar tidak ditemukan di properti ini.');
        }
        return yield room_repository_1.RoomRepository.delete(roomId);
    }),
};
