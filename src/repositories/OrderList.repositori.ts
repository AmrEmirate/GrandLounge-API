import { prisma } from "../config/prisma";
import { Prisma } from "../generated/prisma";

export default class OrderListRepositroy {
    async findReservationByFilter(accountId: number, filter:{
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
            include: { booking_rooms: true},
            orderBy: { createdAt: 'desc'}
        })

    }
}
    