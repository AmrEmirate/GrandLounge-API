import { prisma } from "../config/prisma";
import { Prisma, BookingStatus } from "../generated/prisma";

export default class OrderListRepositroy {
    async updateBookingStatus(bookingId: string, newStatus: string) {
        return prisma.booking.update({
            where: { id: bookingId },
            data: { status: newStatus as BookingStatus },
        });
    }

    async findReservationByFilter(user: string, filter: {
        checkIn?: Date;
        searchQuery?: string;
        status?: string;
        propertyName?: string;
    }) {
        // Inisialisasi object 'where' utama
        const where: Prisma.BookingWhereInput = {
            userId: user,
        };

        // Kumpulkan semua kondisi filter ke dalam array AND
        const andConditions: Prisma.BookingWhereInput[] = [];

        // 1. Tambahkan filter status jika ada
        if (filter.status) {
            where.status = filter.status as BookingStatus;
        }

        // 2. Tambahkan filter nama properti jika ada
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

        // 3. Tambahkan filter tanggal check-in jika ada
        if (filter.checkIn) {
            const targetDate = new Date(filter.checkIn);
            const startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 1);

            andConditions.push({
                checkIn: {
                    gte: startDate,
                    lt: endDate,
                },
            });
        }

        // 4. Tambahkan filter pencarian gabungan (Invoice / No. Pesanan) jika ada
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
                            startsWith: filter.searchQuery,
                            mode: "insensitive",
                        },
                    },
                ],
            });
        }

        // Jika ada kondisi di dalam andConditions, tambahkan ke object 'where' utama
        if (andConditions.length > 0) {
            where.AND = andConditions;
        }

        // Query ke database dengan 'where' clause yang sudah final
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

    async tenantTransactionList(tenantId: string, status?: string) {
        const whereCondition: Prisma.BookingWhereInput = {
            bookingRooms: {
                some: {
                    room: {
                        property: {
                            tenantId: tenantId,
                        },
                    },
                },
            },
        };

        if (status) {
            whereCondition.status = status as BookingStatus;
        }

        return prisma.booking.findMany({
            where: whereCondition,
            include: {
                user: true,
                property: true,
                review: {
                    include: {
                        user: true,
                        property: true,
                    },
                },
                bookingRooms: {
                    include: {
                        room: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
}