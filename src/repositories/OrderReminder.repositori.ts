import { prisma } from "../config/prisma";
import { startOfTomorrow, endOfTomorrow } from "date-fns";

export default class OrderReminderRepository {
    async findBookingById(bookingId: number) {
        return prisma.booking.findUnique({
            where: { id: bookingId },
            include: { user: true, property: true },
        })
    }

    async findUpcomingBookings() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const startOfTomorrow = new Date(tomorrow.setHours(0, 0, 0, 0));
        const endOfTomorrow = new Date(tomorrow.setHours(23, 59, 59, 999));

        return prisma.booking.findMany({
            where: {
                status: "MENUNGGU_PEMBAYARAN",
                check_in: {
                    gte: startOfTomorrow,
                    lte: endOfTomorrow,
                },
            },
            include: { user: true, property: true },
        });
    }
}