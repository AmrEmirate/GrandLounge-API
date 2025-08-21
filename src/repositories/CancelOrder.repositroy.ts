import { prisma } from "../config/prisma";
import { BookingStatus } from "../generated/prisma";

export default class CancelOrderRepository {
    async findBookingById(bookingId: number) {
        return prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                user: true, 
                property: { 
                    include: {
                        tenant: true,
                    },
                },
            },
        });
    }

    async updateBookingStatus(bookingId: number, newStatus: BookingStatus) {
        return prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: newStatus
            }
        })
    }
}