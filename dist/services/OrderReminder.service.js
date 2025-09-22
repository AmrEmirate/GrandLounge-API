"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendDailyReminders = exports.sendOrderConfirmationByInvoice = void 0;
const OrderReminder_repositori_1 = __importDefault(require("../repositories/OrderReminder.repositori"));
const apiError_1 = __importDefault(require("../utils/apiError"));
const SendEmailNotification_service_1 = require("./SendEmailNotification.service");
const reminderRepo = new OrderReminder_repositori_1.default();
const sendOrderConfirmationByInvoice = (invoiceNumber) => __awaiter(void 0, void 0, void 0, function* () {
    const booking = yield reminderRepo.findBookingById(invoiceNumber);
    if (!booking)
        throw new apiError_1.default(404, "Booking not found.");
    yield (0, SendEmailNotification_service_1.sendBookingConfirmEmail)(booking);
});
exports.sendOrderConfirmationByInvoice = sendOrderConfirmationByInvoice;
const sendDailyReminders = () => __awaiter(void 0, void 0, void 0, function* () {
    const upcomingBookings = yield reminderRepo.findUpcomingBookings();
    console.log(`Found ${upcomingBookings.length} bookings for reminder.`);
    for (const booking of upcomingBookings) {
        try {
            yield (0, SendEmailNotification_service_1.sendCheckinReminderEmail)(booking);
        }
        catch (err) {
            console.error(`Failed to send reminder for booking ${booking.id}:`, err);
        }
    }
});
exports.sendDailyReminders = sendDailyReminders;
