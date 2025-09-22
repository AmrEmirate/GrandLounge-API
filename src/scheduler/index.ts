// src/scheduler/index.ts
import cron from 'node-cron';
import { prisma } from '../config/prisma';
import { BookingStatus } from '../../prisma/generated/client';
import { sendDailyReminders } from '../services/OrderReminder.service';

export const startSchedulers = () => {
    /**
     * Scheduler 1: Auto-cancel booking yang belum dibayar
     * Cron: setiap 30 menit
     */
    cron.schedule('*/30 * * * *', async () => {
        console.log('🕒 Running booking cancellation job...');
        const now = new Date();

        try {
            // Update semua booking yang expired sekaligus
            const result = await prisma.booking.updateMany({
                where: {
                    status: BookingStatus.MENUNGGU_PEMBAYARAN,
                    paymentDeadline: { lt: now },
                },
                data: { status: BookingStatus.DIBATALKAN },
            });

            if (result.count > 0) {
                console.log(`✅ ${result.count} bookings were cancelled automatically.`);
            } else {
                console.log('No expired bookings found to cancel.');
            }
        } catch (error) {
            console.error('❌ Error in booking cancellation job:', error);
        }
    }, {
        timezone: 'Asia/Jakarta'
    });

    /**
     * Scheduler 2: Daily check-in reminder H-1
     * Cron: setiap hari jam 09:00 WIB
     */
    cron.schedule('0 9 * * *', async () => {
        console.log('🕘 Running daily check-in reminder job...');
        try {
            await sendDailyReminders();
            console.log('✅ Daily reminders sent successfully.');
        } catch (error) {
            console.error('❌ Error in daily reminder job:', error);
        }
    }, {
        timezone: 'Asia/Jakarta'
    });
};
