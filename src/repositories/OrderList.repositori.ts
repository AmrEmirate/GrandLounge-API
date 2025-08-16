import { prisma } from "../config/prisma";
import { Prisma, BookingStatus } from "../generated/prisma";

export default class OrderListRepositroy {
    async findReservationByFilter(accountId: number, filter: {
        checkIn?: Date,
        checkOut?: Date,
        invoiceNumber?: string
    }) {
        const whereCondition: Prisma.BookingWhereInput = {
            user_id: accountId,
        };

        if (filter.invoiceNumber) {
            whereCondition.invoice_number = {
                contains: filter.invoiceNumber,
            };
        };

        if (filter.checkIn) {
            whereCondition.check_in = {
                gte: filter.checkIn
            };
        };

        if (filter.checkOut) {
            whereCondition.check_out = {
                lte: filter.checkOut
            };
        };

        return prisma.booking.findMany({
            where: whereCondition,
            include: { booking_rooms: true },
            orderBy: { createdAt: 'desc' }
        })

    }

    async tenantTransactionList(tenantId: number, status?: string) {
        const whereCondition: Prisma.BookingWhereInput = {
            booking_rooms: {
                some: {
                    room: {
                        property_id: tenantId
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
                booking_rooms: {
                    include: {
                        room: {
                            include: {
                                property: true
                            }
                        }
                    }
                },
                user: true
            },
            orderBy: { createdAt: "desc" }
        });
    }
}
