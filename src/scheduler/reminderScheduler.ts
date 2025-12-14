import cron from "node-cron";
import OrderReminderService from "../services/orderReminder.service";
import logger from "../utils/logger";

export const startReminderScheduler = () => {
  cron.schedule("0 8 * * *", async () => {
    logger.info("Running H-1 check-in reminders...");
    try {
      await OrderReminderService.sendDailyReminders();
    } catch (error) {
      logger.error(`Error sending daily reminders: ${error}`);
    }
  });
};
