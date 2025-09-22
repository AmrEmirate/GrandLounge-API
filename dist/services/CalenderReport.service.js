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
exports.getAggregatedPropertyReport = exports.getCalenderReport = void 0;
const date_fns_1 = require("date-fns");
const prisma_1 = require("../config/prisma");
const CalenderReport_repositori_1 = __importDefault(require("../repositories/CalenderReport.repositori"));
const apiError_1 = __importDefault(require("../utils/apiError"));
const client_1 = require("../../prisma/generated/client");
const calenderRepo = new CalenderReport_repositori_1.default();
const getCalenderReport = (tenantId, propertyId, roomId, startDate, endDate) => __awaiter(void 0, void 0, void 0, function* () {
    if (!startDate || !endDate || !roomId) {
        throw new apiError_1.default(400, "StartDate, EndDate, and RoomID are required.");
    }
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new apiError_1.default(400, "Invalid date time");
    }
    if (startDate > endDate) {
        throw new apiError_1.default(400, "Start date cannot be after end date.");
    }
    const roomData = yield prisma_1.prisma.room.findFirst({
        where: {
            id: roomId,
            property: {
                id: propertyId,
                tenantId: tenantId
            }
        },
        select: {
            name: true,
            basePrice: true,
            property: { select: { id: true, name: true } }
        }
    });
    if (!roomData) {
        throw new apiError_1.default(404, `Room with id ${roomId} not found in property ${propertyId} for this tenant.`);
    }
    const rawAvailabilityData = yield calenderRepo.getRoomAvailibity(tenantId, propertyId, roomId, startDate, endDate);
    const bookings = yield prisma_1.prisma.booking.findMany({
        where: {
            propertyId: propertyId,
            bookingRooms: {
                some: {
                    roomId: roomId,
                },
            },
            status: { not: client_1.BookingStatus.DIBATALKAN },
            AND: [
                {
                    checkIn: {
                        lt: endDate,
                    },
                },
                {
                    checkOut: {
                        gt: startDate,
                    },
                },
            ],
        },
        select: { checkIn: true, checkOut: true, status: true },
    });
    const calenderDate = {};
    const dateRange = (0, date_fns_1.eachDayOfInterval)({ start: startDate, end: endDate });
    for (const day of dateRange) {
        const dateString = day.toISOString().split('T')[0];
        let dayStatus = 'AVAILABLE';
        let dayPrice = roomData.basePrice;
        const activeBooking = bookings.find(b => day >= b.checkIn && day < b.checkOut);
        if (activeBooking) {
            dayStatus = activeBooking.status === client_1.BookingStatus.MENUNGGU_PEMBAYARAN ? 'PENDING' : 'BOOKED';
        }
        else {
            const availabilityRecord = rawAvailabilityData.find(r => r.date.toISOString().split('T')[0] === dateString);
            if (availabilityRecord) {
                if (!availabilityRecord.isAvailable) {
                    dayStatus = 'UNAVAILABLE';
                }
                if (availabilityRecord.price > 0) {
                    dayPrice = availabilityRecord.price;
                }
            }
        }
        calenderDate[dateString] = {
            propertyId: roomData.property.id,
            propertyName: roomData.property.name,
            roomId: roomId,
            roomName: roomData.name,
            status: dayStatus,
            price: dayPrice,
        };
    }
    return calenderDate;
});
exports.getCalenderReport = getCalenderReport;
const getAggregatedPropertyReport = (tenantId, propertyId, startDate, endDate) => __awaiter(void 0, void 0, void 0, function* () {
    const rawAvailabilityData = yield calenderRepo.getRoomAvailibity(tenantId, propertyId, undefined, startDate, endDate);
    const totalRoomsInProperty = yield prisma_1.prisma.room.count({
        where: { propertyId: propertyId, deletedAt: null }
    });
    if (totalRoomsInProperty === 0)
        return {};
    const groupedByDate = new Map();
    for (const record of rawAvailabilityData) {
        const dateString = record.date.toISOString().split('T')[0];
        if (!groupedByDate.has(dateString)) {
            groupedByDate.set(dateString, []);
        }
        groupedByDate.get(dateString).push(record);
    }
    const availabilityByDate = {};
    const dateRange = (0, date_fns_1.eachDayOfInterval)({ start: startDate, end: endDate });
    for (const day of dateRange) {
        const dateString = day.toISOString().split('T')[0];
        const recordsForDate = groupedByDate.get(dateString) || [];
        const availableRecordsCount = recordsForDate.filter(r => r.isAvailable).length;
        const totalRecordsCount = recordsForDate.length;
        const unrecordedAvailableCount = totalRoomsInProperty - totalRecordsCount;
        const totalAvailableCount = availableRecordsCount + unrecordedAvailableCount;
        let status;
        if (totalAvailableCount === 0) {
            status = 'FULLY_BOOKED';
        }
        else if (totalAvailableCount >= totalRoomsInProperty) {
            status = 'FULLY_AVAILABLE';
        }
        else {
            status = 'PARTIALLY_AVAILABLE';
        }
        availabilityByDate[dateString] = {
            status,
            availableCount: totalAvailableCount,
            totalRooms: totalRoomsInProperty
        };
    }
    return availabilityByDate;
});
exports.getAggregatedPropertyReport = getAggregatedPropertyReport;
