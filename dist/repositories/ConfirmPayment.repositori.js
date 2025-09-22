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
class ConfirmPaymentRepository {
    constructor(prismaClient = prisma_1.prisma) {
        this.prismaClient = prismaClient;
    }
    findBookingByInvoice(invoiceNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prismaClient.booking.findFirst({
                where: { invoiceNumber },
                include: { property: true },
            });
        });
    }
    updateBookingStatus(bookingId, newStatus) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prismaClient.booking.update({
                where: { id: bookingId },
                data: { status: newStatus },
                include: { property: true, user: true },
            });
        });
    }
    clearPaymentProof(bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prismaClient.booking.update({
                where: { id: bookingId },
                data: { paymentProof: null },
            });
        });
    }
}
exports.default = ConfirmPaymentRepository;
