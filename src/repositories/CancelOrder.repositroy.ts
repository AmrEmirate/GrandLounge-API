import { prisma } from "../config/prisma";
import { BookingStatus } from "../../prisma/generated/client";

export default class CancelOrderRepository {
    async findBookingById(invoiceNumber: string) {
        return prisma.booking.findUnique({
            where: { invoiceNumber },
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

    async updateBookingStatus(invoiceNumber: string, newStatus: BookingStatus) {
        return prisma.booking.update({
            where: { invoiceNumber },
            data: {
                status: newStatus
            }
        })
    }
}