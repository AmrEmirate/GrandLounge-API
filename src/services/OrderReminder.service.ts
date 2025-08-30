import OrderReminderRepository from "../repositories/OrderReminder.repositori";
import ApiError from "../utils/apiError";
import { sendBookingConfirmEmail, sendCheckinReminderEmail } from "./SendEmailNotification.service";

const reminderRepo = new OrderReminderRepository();

export const sendOrderConfirmationByInvoice = async (invoiceNumber: string) => {
    const booking = await reminderRepo.findBookingById(invoiceNumber);
    if (!booking) throw new ApiError(404, "Booking not found.");
    await sendBookingConfirmEmail(booking);
};

export const sendDailyReminders = async () => {
    const upcomingBookings = await reminderRepo.findUpcomingBookings();
    console.log(`Found ${upcomingBookings.length} bookings for reminder.`);

    for (const booking of upcomingBookings) {
        try {
            await sendCheckinReminderEmail(booking);
        } catch (err) {
            console.error(`Failed to send reminder for booking ${booking.id}:`, err);
        }
    }
};