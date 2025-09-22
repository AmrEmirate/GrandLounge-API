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
exports.startBookingCancellationScheduler = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const prisma_1 = require("../config/prisma");
const prisma_2 = require("../generated/prisma");
const startBookingCancellationScheduler = () => {
    node_cron_1.default.schedule("*/30 * * * *", () => __awaiter(void 0, void 0, void 0, function* () {
        console.log("Running booking cancellation job...");
        const now = new Date();
        try {
            const expiredBookings = yield prisma_1.prisma.booking.findMany({
                where: { status: prisma_2.BookingStatus.MENUNGGU_PEMBAYARAN, paymentDeadline: { lt: now } },
            });
            if (expiredBookings.length > 0) {
                const result = yield prisma_1.prisma.booking.updateMany({
                    where: { id: { in: expiredBookings.map(b => b.id) } },
                    data: { status: prisma_2.BookingStatus.DIBATALKAN },
                });
                console.log(`✅ ${result.count} bookings cancelled automatically.`);
            }
            else {
                console.log("No expired bookings found to cancel.");
            }
        }
        catch (error) {
            console.error("Error in booking cancellation job:", error);
        }
    }));
};
exports.startBookingCancellationScheduler = startBookingCancellationScheduler;
