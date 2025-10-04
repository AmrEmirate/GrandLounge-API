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
exports.RoomAvailabilityService = void 0;
const room_repository_1 = __importDefault(require("../repositories/room.repository"));
const property_repository_1 = require("../repositories/property.repository");
const roomAvailability_repository_1 = require("../repositories/roomAvailability.repository");
const date_fns_1 = require("date-fns");
const prisma_1 = require("../config/prisma");
exports.RoomAvailabilityService = {
    getMonthlyAvailability: (tenantId, propertyId, roomId, month, year) => __awaiter(void 0, void 0, void 0, function* () {
        const property = yield property_repository_1.PropertyRepository.findByIdAndTenantId(propertyId, tenantId);
        if (!property) {
            throw new Error('Properti tidak ditemukan atau Anda tidak memiliki akses.');
        }
        const room = yield room_repository_1.default.findById(roomId);
        if (!room || room.propertyId !== propertyId) {
            throw new Error('Kamar tidak ditemukan di properti ini.');
        }
        const startDate = (0, date_fns_1.startOfMonth)(new Date(year, month - 1));
        const endDate = (0, date_fns_1.endOfMonth)(new Date(year, month - 1));
        return prisma_1.prisma.roomAvailability.findMany({
            where: {
                roomId: roomId,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });
    }),
    updateAvailability: (tenantId, propertyId, roomId, data) => __awaiter(void 0, void 0, void 0, function* () {
        const property = yield property_repository_1.PropertyRepository.findByIdAndTenantId(propertyId, tenantId);
        if (!property) {
            throw new Error('Properti tidak ditemukan atau Anda tidak memiliki akses.');
        }
        const room = yield room_repository_1.default.findById(roomId);
        if (!room || room.propertyId !== propertyId) {
            throw new Error('Kamar tidak ditemukan di properti ini.');
        }
        const { startDate, endDate, price, isAvailable } = data;
        const dateInterval = (0, date_fns_1.eachDayOfInterval)({
            start: new Date(startDate),
            end: new Date(endDate),
        });
        const availabilityData = dateInterval.map(date => ({
            roomId: roomId,
            date: date,
            price: price !== undefined ? price : room.basePrice,
            isAvailable: isAvailable !== undefined ? isAvailable : true,
        }));
        yield roomAvailability_repository_1.RoomAvailabilityRepository.upsertMany(availabilityData);
    }),
};
