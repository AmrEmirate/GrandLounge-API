import { prisma } from "../config/prisma";
import { BookingStatus } from "../../prisma/generated/client";

// Fungsi ini akan dijalankan setiap beberapa menit untuk cek booking pending
export const autoCancelBooking = async () => {
    try {
        const now = new Date();
        const pendingBookings = await prisma.booking.findMany({
            where: {
                status: BookingStatus.MENUNGGU_PEMBAYARAN,
                paymentDeadline: { lt: now },
            },
        });

        for (const booking of pendingBookings) {
            await prisma.booking.update({
                where: { id: booking.id },
                data: { status: BookingStatus.DIBATALKAN },
            });
            console.log(`Booking ${booking.id} auto-cancelled due to expired paymentDeadline`);
        }
    } catch (err) {
        console.error("Auto-cancel booking failed:", err);
    }
};
