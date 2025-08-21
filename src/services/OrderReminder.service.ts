// src/services/OrderReminder.service.ts
import OrderReminderRepository from "../repositories/OrderReminder.repositori";
import ApiError from "../utils/apiError";
import { sendBookingConfirmEmail, sendCheckinReminderEmail } from "../services/SendEmailNotification.service";

const reminderRepo = new OrderReminderRepository();

// Dipanggil dari ConfirmPaymentService setelah pembayaran berhasil
export const sendOrderConfirmation = async (bookingId: number) => {
    const booking = await reminderRepo.findBookingById(bookingId);
    if (!booking) throw new ApiError(404, "Booking not found.");
    // if (booking.status !== BookingStatus.DIPROSES) throw new ApiError(400, "Invalid status.");

    await sendBookingConfirmEmail(booking);
};

// Dipanggil oleh scheduler setiap hari
export const sendDailyReminders = async () => {
    const upcomingBookings = await reminderRepo.findUpcomingBookings();
    console.log(`Found ${upcomingBookings.length} bookings for reminder.`);

    for (const booking of upcomingBookings) {
        await sendCheckinReminderEmail(booking);
    }
};