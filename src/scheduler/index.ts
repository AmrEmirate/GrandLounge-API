// src/scheduler/index.ts
import cron from 'node-cron';
import { prisma } from '../config/prisma';
import { BookingStatus } from '../generated/prisma';
import { sendDailyReminders } from '../services/OrderReminder.service';

export const startSchedulers = () => {
    // Scheduler untuk pembatalan pesanan yang tidak dibayar
    cron.schedule('*/30 * * * *', async () => {
        console.log('Running booking cancellation job...');
        const now = new Date();

        try {
            const expiredBookings = await prisma.booking.findMany({
                where: {
                    status: BookingStatus.MENUNGGU_PEMBAYARAN,
                    paymentDeadline: {
                        lt: now,
                    },
                },
            });

            if (expiredBookings.length > 0) {
                const result = await prisma.booking.updateMany({
                    where: {
                        id: {
                            in: expiredBookings.map(b => b.id),
                        },
                    },
                    data: {
                        status: BookingStatus.DIBATALKAN,
                    },
                });
                console.log(`${result.count} bookings were cancelled automatically.`);
            } else {
                console.log('No expired bookings found to cancel.');
            }
        } catch (error) {
            console.error('Error in booking cancellation job:', error);
        }
    }, {
        timezone: "Asia/Jakarta"
    });

    // Scheduler untuk pengingat check-in H-1
    cron.schedule('0 9 * * *', async () => {
        console.log('Running daily check-in reminder job...');
        await sendDailyReminders();
    }, {
        timezone: "Asia/Jakarta"
    });
};