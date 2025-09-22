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
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoCancelBooking = void 0;
const prisma_1 = require("../config/prisma");
const client_1 = require("../../prisma/generated/client");
// Fungsi ini akan dijalankan setiap beberapa menit untuk cek booking pending
const autoCancelBooking = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const now = new Date();
        const pendingBookings = yield prisma_1.prisma.booking.findMany({
            where: {
                status: client_1.BookingStatus.MENUNGGU_PEMBAYARAN,
                paymentDeadline: { lt: now },
            },
        });
        for (const booking of pendingBookings) {
            yield prisma_1.prisma.booking.update({
                where: { id: booking.id },
                data: { status: client_1.BookingStatus.DIBATALKAN },
            });
            console.log(`Booking ${booking.id} auto-cancelled due to expired paymentDeadline`);
        }
    }
    catch (err) {
        console.error("Auto-cancel booking failed:", err);
    }
});
exports.autoCancelBooking = autoCancelBooking;
