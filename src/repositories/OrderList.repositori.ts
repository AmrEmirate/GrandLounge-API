import { prisma } from "../config/prisma";
import { Prisma, BookingStatus } from "../../prisma/generated/client";

export default class OrderListRepositroy {
    async updateBookingStatus(bookingId: string, newStatus: string) {
        return prisma.booking.update({
            where: { id: bookingId },
            data: { status: newStatus as BookingStatus },
        });
    }

    async findTransactionsByFilterForTenant(tenantId: string, filter: {
        checkIn?: Date;
        searchQuery?: string;
        status?: BookingStatus;
        propertyId?: string;
    }) {
        const where: Prisma.BookingWhereInput = {
            user: {
                id: { not: undefined }
            },
            property: {
                tenantId: tenantId,
                id: { not: undefined }
            },
        };

        const andConditions: Prisma.BookingWhereInput[] = [];

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
            const startDate = new Date(
                Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), 0, 0, 0, 0)
            );

            const endDate = new Date(
                Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), 23, 59, 59, 999)
            );

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

        return prisma.booking.findMany({
            where,
            include: {
                user: { select: { fullName: true } },
                property: { select: { name: true, mainImage: true } }, 
                review: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findReservationByFilter(user: string, filter: {
        checkIn?: Date;
        searchQuery?: string;
        status?: string;
        propertyName?: string;
    }) {
        const where: Prisma.BookingWhereInput = {
            userId: user,
        };

        const andConditions: Prisma.BookingWhereInput[] = [];

        if (filter.status) {
            where.status = filter.status as BookingStatus;
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
            const startDate = new Date(Date.UTC(
                targetDate.getUTCFullYear(),
                targetDate.getUTCMonth(),
                targetDate.getUTCDate(),
                0, 0, 0, 0
            ));
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

        return prisma.booking.findMany({
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
    }

    async findPendingConfirmationForTenant(tenantId: string, limit: number = 5) {
        return prisma.booking.findMany({
            where: {
                status: BookingStatus.MENUNGGU_KONFIRMASI,
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
    }
}