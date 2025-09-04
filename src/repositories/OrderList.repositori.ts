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
        checkIn?: Date,
        checkOut?: Date,
        invoiceNumber?: string,
        status?: string,
        propertyName?: string
    }) {
        const whereCondition: Prisma.BookingWhereInput = {
            userId: user,
            ...(filter.status && { status: filter.status as BookingStatus }),
        };

        if (filter.invoiceNumber) {
            whereCondition.invoiceNumber = {
                contains: filter.invoiceNumber,
                mode: "insensitive"
            };
        };

        if (filter.propertyName) {
            whereCondition.property = {
                name: {
                    contains: filter.propertyName,
                    mode: 'insensitive'
                }
            };
        }

        if (filter.checkIn) {
            // Ambil tanggal dari filter
            const targetDate = new Date(filter.checkIn);

            // Tentukan awal hari (pukul 00:00:00) DARI TANGGAL TERSEBUT
            const startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

            // Tentukan awal hari BERIKUTNYA
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 1);

            whereCondition.checkIn = {
                gte: startDate, // Lebih besar atau sama dengan awal hari yang dipilih
                lt: endDate     // Lebih KECIL dari awal hari berikutnya
            };
        }

        return prisma.booking.findMany({
            where: whereCondition,
            include: {
                bookingRooms: true,
                property: true,
                review: {
                    include: {
                        user: true,
                        property: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

    }

    async tenantTransactionList(tenantId: string, status?: string) {
        const whereCondition: Prisma.BookingWhereInput = {
            bookingRooms: {
                some: {
                    room: {
                        property: {
                            tenantId: tenantId
                        }
                    }
                }
            }
        };

        if (status) {
            whereCondition.status = status as BookingStatus;
        };

        return prisma.booking.findMany({
            where: whereCondition,
            include: {
                bookingRooms: {
                    include: {
                        room: {
                            include: {
                                property: true
                            }
                        }
                    }
                },
                user: true,
                property: true
            },
            orderBy: { createdAt: "desc" }
        });
    }
}
