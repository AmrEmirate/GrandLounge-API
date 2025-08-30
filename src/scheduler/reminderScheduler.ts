import cron from "node-cron";
import { sendDailyReminders } from "../services/OrderReminder.service";

export const startReminderScheduler = () => {
    cron.schedule("0 8 * * *", async () => {
        console.log("Running H-1 check-in reminders...");
        try { await sendDailyReminders(); }
        catch (error) { console.error("Error sending daily reminders:", error); }
    });
};