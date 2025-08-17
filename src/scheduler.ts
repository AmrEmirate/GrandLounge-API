import cron from 'node-cron';
import { sendDailyReminders } from './services/OrderReminder.service';

cron.schedule('0 7 * * *', () => {
    console.log('Running daily reminder task...');
    sendDailyReminders();
}, {
    timezone: "Asia/Jakarta"
});
