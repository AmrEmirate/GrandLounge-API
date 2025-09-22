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
const prisma_1 = require("../config/prisma");
const date_fns_1 = require("date-fns");
class OrderReminderRepository {
    findBookingById(invoiceNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.booking.findUnique({
                where: { invoiceNumber },
                include: { user: true, property: true },
            });
        });
    }
    findUpcomingBookings() {
        return __awaiter(this, void 0, void 0, function* () {
            const tomorrowStart = (0, date_fns_1.startOfDay)((0, date_fns_1.addDays)(new Date(), 1));
            const dayAfterTomorrowStart = (0, date_fns_1.startOfDay)((0, date_fns_1.addDays)(new Date(), 2));
            return prisma_1.prisma.booking.findMany({
                where: {
                    status: "DIPROSES",
                    checkIn: {
                        gte: tomorrowStart,
                        lt: dayAfterTomorrowStart,
                    },
                    user: {
                        deletedAt: null
                    },
                    property: {
                        deletedAt: null
                    }
                },
                include: { user: true, property: true },
            });
        });
    }
}
exports.default = OrderReminderRepository;
