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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const room_repository_1 = __importDefault(require("../repositories/room.repository"));
const property_repository_1 = require("../repositories/property.repository");
const apiError_1 = __importDefault(require("../utils/apiError"));
class RoomService {
    verifyPropertyAccess(propertyId, tenantId) {
        return __awaiter(this, void 0, void 0, function* () {
            const property = yield property_repository_1.PropertyRepository.findByIdAndTenantId(propertyId, tenantId);
            if (!property) {
                throw new apiError_1.default(404, 'Properti tidak ditemukan atau Anda tidak memiliki akses.');
            }
        });
    }
    verifyRoomOwnership(roomId, propertyId) {
        return __awaiter(this, void 0, void 0, function* () {
            const room = yield room_repository_1.default.findById(roomId);
            if (!room || room.propertyId !== propertyId) {
                throw new apiError_1.default(404, 'Kamar tidak ditemukan di properti ini.');
            }
            return room;
        });
    }
    createRoom(tenantId, propertyId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.verifyPropertyAccess(propertyId, tenantId);
            return yield room_repository_1.default.create(propertyId, data);
        });
    }
    getRoomsByProperty(tenantId, propertyId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.verifyPropertyAccess(propertyId, tenantId);
            return yield room_repository_1.default.findAllByPropertyId(propertyId);
        });
    }
    getRoomById(tenantId, propertyId, roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.verifyPropertyAccess(propertyId, tenantId);
            const room = yield room_repository_1.default.findById(roomId);
            // Mengembalikan null jika kamar bukan milik properti tersebut, tanpa melempar error
            if (!room || room.propertyId !== propertyId) {
                return null;
            }
            return room;
        });
    }
    updateRoom(tenantId, propertyId, roomId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.verifyPropertyAccess(propertyId, tenantId);
            yield this.verifyRoomOwnership(roomId, propertyId);
            return yield room_repository_1.default.update(roomId, data);
        });
    }
    deleteRoom(tenantId, propertyId, roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.verifyPropertyAccess(propertyId, tenantId);
            yield this.verifyRoomOwnership(roomId, propertyId);
            return yield room_repository_1.default.delete(roomId);
        });
    }
}
exports.default = new RoomService();
