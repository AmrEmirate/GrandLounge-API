import { prisma } from "../config/prisma";
import { Prisma, BookingStatus } from "../generated/prisma";

export default class OrderListRepositroy {
    async findReservationByFilter(user: string, filter: {
        checkIn?: Date,
        checkOut?: Date,
        invoiceNumber?: string,
        status?: string
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

        if (filter.checkIn || filter.checkOut) {
            whereCondition.checkIn = {};
            if (filter.checkIn) {
                whereCondition.checkIn.gte = filter.checkIn;
            }
            if (filter.checkOut) {
                whereCondition.checkIn.lte = filter.checkOut;
            }
        };

        return prisma.booking.findMany({
            where: whereCondition,
            include: { 
                bookingRooms: true,
                property: true,
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
