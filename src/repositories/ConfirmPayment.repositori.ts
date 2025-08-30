import { prisma } from "../config/prisma";
import { BookingStatus } from "../generated/prisma";

export default class ConfirmPaymentRepository {
    async findBookingByInvoice(invoiceNumber: string) {
        return prisma.booking.findFirst({
            where: { invoiceNumber },
            include: { property: true, user: true },
        });
    }

    async updateBookingStatus(bookingId: string, status: BookingStatus) {
        return prisma.booking.update({
            where: { id: bookingId },
            data: { status },
            include: { property: true, user: true },
        });
    }
}
