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
exports.ConfirmPaymentService = void 0;
const client_1 = require("../../prisma/generated/client");
const ConfirmPayment_repositori_1 = __importDefault(require("../repositories/ConfirmPayment.repositori"));
const apiError_1 = __importDefault(require("../utils/apiError"));
const prisma_1 = require("../config/prisma");
const SendEmailNotification_service_1 = require("../services/SendEmailNotification.service");
const ConfirmPaymentService = (tenantId, invoiceNumber, isAccepted) => __awaiter(void 0, void 0, void 0, function* () {
    // Mulai transaksi untuk memastikan semua operasi DB aman
    const updatedBooking = yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // Buat instance repo BARU KHUSUS untuk transaksi ini
        // dengan memberikan 'tx' ke constructor
        const transactionalRepo = new ConfirmPayment_repositori_1.default(tx);
        // Gunakan repo transaksional untuk semua operasi di dalam sini
        const booking = yield transactionalRepo.findBookingByInvoice(invoiceNumber);
        if (!booking) {
            throw new apiError_1.default(404, "Booking not found");
        }
        if (booking.property.tenantId !== tenantId) {
            throw new apiError_1.default(403, "You do not have permission to confirm this payment.");
        }
        if (booking.status !== "MENUNGGU_PEMBAYARAN" &&
            booking.status !== "MENUNGGU_KONFIRMASI") {
            throw new apiError_1.default(400, "This booking cannot be canceled at its current status.");
        }
        let newStatus;
        if (isAccepted) {
            newStatus = client_1.BookingStatus.DIPROSES;
        }
        else {
            newStatus = client_1.BookingStatus.MENUNGGU_PEMBAYARAN;
        }
        const result = yield transactionalRepo.updateBookingStatus(booking.id, newStatus);
        if (!isAccepted) {
            yield transactionalRepo.clearPaymentProof(booking.id);
        }
        return result;
    }));
    try {
        if (isAccepted) {
            const message = "Pembayaran Anda telah diterima. Pemesanan Anda sedang diproses.";
            yield (0, SendEmailNotification_service_1.sendNotification)(updatedBooking.userId, message);
            yield (0, SendEmailNotification_service_1.sendBookingConfirmEmail)(updatedBooking);
        }
        else {
            const message = "Pembayaran Anda ditolak. Silakan upload ulang bukti pembayaran.";
            yield (0, SendEmailNotification_service_1.sendNotification)(updatedBooking.userId, message);
            yield (0, SendEmailNotification_service_1.sendPaymentRejectedEmail)(updatedBooking);
        }
    }
    catch (error) {
        throw new apiError_1.default(500, `Gagal mengirim notifikasi untuk booking ${updatedBooking.id}:`);
    }
    return updatedBooking;
});
exports.ConfirmPaymentService = ConfirmPaymentService;
