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
exports.startSchedulers = void 0;
// src/scheduler/index.ts
const node_cron_1 = __importDefault(require("node-cron"));
const prisma_1 = require("../config/prisma");
const prisma_2 = require("../generated/prisma");
const OrderReminder_service_1 = require("../services/OrderReminder.service");
const startSchedulers = () => {
    /**
     * Scheduler 1: Auto-cancel booking yang belum dibayar
     * Cron: setiap 30 menit
     */
    node_cron_1.default.schedule('*/30 * * * *', () => __awaiter(void 0, void 0, void 0, function* () {
        console.log('🕒 Running booking cancellation job...');
        const now = new Date();
        try {
            // Update semua booking yang expired sekaligus
            const result = yield prisma_1.prisma.booking.updateMany({
                where: {
                    status: prisma_2.BookingStatus.MENUNGGU_PEMBAYARAN,
                    paymentDeadline: { lt: now },
                },
                data: { status: prisma_2.BookingStatus.DIBATALKAN },
            });
            if (result.count > 0) {
                console.log(`✅ ${result.count} bookings were cancelled automatically.`);
            }
            else {
                console.log('No expired bookings found to cancel.');
            }
        }
        catch (error) {
            console.error('❌ Error in booking cancellation job:', error);
        }
    }), {
        timezone: 'Asia/Jakarta'
    });
    /**
     * Scheduler 2: Daily check-in reminder H-1
     * Cron: setiap hari jam 09:00 WIB
     */
    node_cron_1.default.schedule('0 9 * * *', () => __awaiter(void 0, void 0, void 0, function* () {
        console.log('🕘 Running daily check-in reminder job...');
        try {
            yield (0, OrderReminder_service_1.sendDailyReminders)();
            console.log('✅ Daily reminders sent successfully.');
        }
        catch (error) {
            console.error('❌ Error in daily reminder job:', error);
        }
    }), {
        timezone: 'Asia/Jakarta'
    });
};
exports.startSchedulers = startSchedulers;
