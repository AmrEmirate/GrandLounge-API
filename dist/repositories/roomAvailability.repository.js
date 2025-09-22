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
exports.RoomAvailabilityRepository = void 0;
const prisma_1 = require("../config/prisma");
const date_fns_1 = require("date-fns");
exports.RoomAvailabilityRepository = {
    findForMonth: (roomId, month, year) => __awaiter(void 0, void 0, void 0, function* () {
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
    upsertMany: (data) => __awaiter(void 0, void 0, void 0, function* () {
        const operations = data.map((item) => prisma_1.prisma.roomAvailability.upsert({
            where: {
                roomId_date: {
                    roomId: item.roomId,
                    date: new Date(item.date),
                },
            },
            update: {
                price: item.price,
                isAvailable: item.isAvailable,
            },
            create: {
                roomId: item.roomId,
                date: new Date(item.date),
                price: item.price,
                isAvailable: item.isAvailable,
            },
        }));
        yield prisma_1.prisma.$transaction(operations);
    }),
    findManyByRoomIdAndDateRange: (roomId, startDate, endDate) => __awaiter(void 0, void 0, void 0, function* () {
        return prisma_1.prisma.roomAvailability.findMany({
            where: {
                roomId: roomId,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: {
                date: 'asc',
            },
        });
    }),
};
