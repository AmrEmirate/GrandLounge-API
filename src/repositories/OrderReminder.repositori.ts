import { prisma } from "../config/prisma";
import { startOfDay, addDays } from 'date-fns';

export default class OrderReminderRepository {
    /**
     * 
     * @param bookingId 
     */
    async findBookingById(bookingId: string) { 
        return prisma.booking.findUnique({
            where: { id: bookingId }, 
            include: { user: true, property: true },
        });
    }

    async findUpcomingBookings() {
        const tomorrowStart = startOfDay(addDays(new Date(), 1));
        const dayAfterTomorrowStart = startOfDay(addDays(new Date(), 2));

        return prisma.booking.findMany({
            where: {
                status: "DIPROSES", 
                checkIn: { 
                    gte: tomorrowStart,
                    lt: dayAfterTomorrowStart,
                },
                user: {
                    deletedAt: null
                },
                property: {
                    deletedAt: null
                }
            },
            include: { user: true, property: true },
        });
    }
}