// src/repositories/OrderReminder.repositori.ts
import { prisma } from "../config/prisma";
import { startOfDay, addDays } from 'date-fns';

export default class OrderReminderRepository {
    async findBookingById(bookingId: number) {
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
            },
            include: { user: true, property: true },
        });
    }
}