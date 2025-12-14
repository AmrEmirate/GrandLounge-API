import cron from "node-cron";
import { prisma } from "../config/prisma";
import { BookingStatus } from "@prisma/client";
import OrderReminderService from "../services/orderReminder.service";
import logger from "../utils/logger";

export const startSchedulers = () => {
  cron.schedule(
    "*/30 * * * *",
    async () => {
      logger.info("Running booking cancellation job...");
      const now = new Date();

      try {
        const result = await prisma.booking.updateMany({
          where: {
            status: BookingStatus.MENUNGGU_PEMBAYARAN,
            paymentDeadline: { lt: now },
          },
          data: { status: BookingStatus.DIBATALKAN },
        });

        if (result.count > 0) {
          logger.info(`${result.count} bookings were cancelled automatically.`);
        }
      } catch (error) {
        logger.error(`Error in booking cancellation job: ${error}`);
      }
    },
    {
      timezone: "Asia/Jakarta",
    }
  );

  cron.schedule(
    "0 9 * * *",
    async () => {
      logger.info("Running daily check-in reminder job...");
      try {
        await OrderReminderService.sendDailyReminders();
        logger.info("Daily reminders sent successfully.");
      } catch (error) {
        logger.error(`Error in daily reminder job: ${error}`);
      }
    },
    {
      timezone: "Asia/Jakarta",
    }
  );
};
