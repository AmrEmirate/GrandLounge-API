import OrderReminderRepository from "../repositories/orderReminder.repository";
import ApiError from "../utils/apiError";
import logger from "../utils/logger";
import EmailNotificationService from "./sendEmailNotification.service";

class OrderReminderService {
  private reminderRepo: OrderReminderRepository;

  constructor() {
    this.reminderRepo = new OrderReminderRepository();
  }

  public async sendOrderConfirmationByInvoice(invoiceNumber: string) {
    const booking = await this.reminderRepo.findBookingById(invoiceNumber);
    if (!booking) throw new ApiError(404, "Booking not found.");
    await EmailNotificationService.sendBookingConfirmEmail(booking);
  }

  public async sendDailyReminders() {
    const upcomingBookings = await this.reminderRepo.findUpcomingBookings();
    logger.info(`Found ${upcomingBookings.length} bookings for reminder.`);

    for (const booking of upcomingBookings) {
      try {
        await EmailNotificationService.sendCheckinReminderEmail(booking);
      } catch (err) {
        logger.error(
          `Failed to send reminder for booking ${booking.id}: ${err}`
        );
      }
    }
  }
}

export default new OrderReminderService();
