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
const prisma_2 = require("../generated/prisma");
class OrderListRepositroy {
    updateBookingStatus(bookingId, newStatus) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.booking.update({
                where: { id: bookingId },
                data: { status: newStatus },
            });
        });
    }
    findTransactionsByFilterForTenant(tenantId, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {
                user: {
                    id: { not: undefined }
                },
                property: {
                    tenantId: tenantId,
                    id: { not: undefined }
                },
            };
            const andConditions = [];
            if (filter.status) {
                where.status = filter.status;
            }
            if (filter.propertyId) {
                andConditions.push({
                    propertyId: filter.propertyId,
                });
            }
            if (filter.searchQuery) {
                andConditions.push({
                    OR: [
                        { user: { fullName: { contains: filter.searchQuery, mode: 'insensitive' } } },
                        { property: { name: { contains: filter.searchQuery, mode: 'insensitive' } } },
                        { invoiceNumber: { contains: filter.searchQuery, mode: 'insensitive' } },
                        { reservationId: { contains: filter.searchQuery, mode: 'insensitive' } },
                    ],
                });
            }
            if (filter.checkIn) {
                const targetDate = new Date(filter.checkIn);
                const startDate = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), 0, 0, 0, 0));
                const endDate = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), 23, 59, 59, 999));
                andConditions.push({
                    checkIn: {
                        gte: startDate,
                        lte: endDate,
                    },
                });
            }
            if (andConditions.length > 0) {
                where.AND = andConditions;
            }
            return prisma_1.prisma.booking.findMany({
                where,
                include: {
                    user: { select: { fullName: true } },
                    property: { select: { name: true, mainImage: true } },
                    review: true,
                },
                orderBy: { createdAt: 'desc' },
            });
        });
    }
    findReservationByFilter(user, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {
                userId: user,
            };
            const andConditions = [];
            if (filter.status) {
                where.status = filter.status;
            }
            if (filter.propertyName) {
                andConditions.push({
                    property: {
                        name: {
                            contains: filter.propertyName,
                            mode: 'insensitive',
                        },
                    },
                });
            }
            if (filter.checkIn) {
                const targetDate = new Date(filter.checkIn);
                const startDate = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), 0, 0, 0, 0));
                const endDate = new Date(startDate);
                endDate.setUTCDate(startDate.getUTCDate() + 1);
                andConditions.push({
                    checkIn: {
                        gte: startDate,
                        lt: endDate,
                    },
                });
            }
            if (filter.searchQuery) {
                andConditions.push({
                    OR: [
                        {
                            invoiceNumber: {
                                contains: filter.searchQuery,
                                mode: "insensitive",
                            },
                        },
                        {
                            reservationId: {
                                contains: filter.searchQuery,
                                mode: "insensitive",
                            },
                        },
                    ],
                });
            }
            if (andConditions.length > 0) {
                where.AND = andConditions;
            }
            return prisma_1.prisma.booking.findMany({
                where,
                include: {
                    bookingRooms: true,
                    property: true,
                    review: {
                        include: {
                            user: true,
                            property: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
        });
    }
    findPendingConfirmationForTenant(tenantId_1) {
        return __awaiter(this, arguments, void 0, function* (tenantId, limit = 5) {
            return prisma_1.prisma.booking.findMany({
                where: {
                    status: prisma_2.BookingStatus.MENUNGGU_KONFIRMASI,
                    property: {
                        tenantId: tenantId,
                    },
                    // Pastikan hanya mengambil yang relevan
                    paymentProof: {
                        not: null
                    },
                },
                include: {
                    user: { select: { fullName: true, profilePicture: true } },
                    property: { select: { name: true } },
                },
                orderBy: {
                    updatedAt: 'desc',
                },
                take: limit,
            });
        });
    }
}
exports.default = OrderListRepositroy;
