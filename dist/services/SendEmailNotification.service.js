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
exports.sendNotification = exports.sendPaymentRejectedEmail = exports.sendCheckinReminderEmail = exports.sendBookingConfirmEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});
// Email konfirmasi booking
const sendBookingConfirmEmail = (booking) => __awaiter(void 0, void 0, void 0, function* () {
    yield transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: booking.user.email,
        subject: "Pemesanan Anda Telah Dikonfirmasi",
        html: `
      <h1>Detail Pemesanan</h1>
      <p>Properti: <b>${booking.property.name}</b></p>
      <p>Check-in: ${booking.checkIn.toDateString()}</p>
      <p>Check-out: ${booking.checkOut.toDateString()}</p>
      <h2>Aturan Properti</h2>
      <p>${booking.property.description || "Tidak ada aturan properti."}</p>
    `,
    });
    console.log(`✅ Email konfirmasi dikirim ke ${booking.user.email}`);
});
exports.sendBookingConfirmEmail = sendBookingConfirmEmail;
// Email reminder H-1 check-in
const sendCheckinReminderEmail = (booking) => __awaiter(void 0, void 0, void 0, function* () {
    yield transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: booking.user.email,
        subject: "Pengingat Check-in Besok",
        html: `
      <h1>Pengingat Check-in</h1>
      <p>Hai ${booking.user.fullName},</p>
      <p>Besok Anda akan check-in di properti <b>${booking.property.name}</b>.</p>
      <p>Check-in: ${booking.checkIn.toDateString()}</p>
      <p>Check-out: ${booking.checkOut.toDateString()}</p>
      <h2>Aturan Properti</h2>
      <p>${booking.property.description || "Tidak ada aturan properti."}</p>
    `,
    });
    console.log(`⏰ Email reminder dikirim ke ${booking.user.email}`);
});
exports.sendCheckinReminderEmail = sendCheckinReminderEmail;
const sendPaymentRejectedEmail = (booking) => __awaiter(void 0, void 0, void 0, function* () {
    yield transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: booking.user.email,
        subject: "Informasi Pembayaran Anda",
        html: `
            <h1>Pembayaran Ditolak</h1>
            <p>Hai ${booking.user.fullName},</p>
            <p>Mohon maaf, pembayaran untuk invoice <b>${booking.invoiceNumber}</b> telah kami tolak.</p>
            <p>Silakan periksa kembali bukti pembayaran Anda dan unggah ulang.</p>
        `,
    });
    console.log(`❌ Email penolakan pembayaran dikirim ke ${booking.user.email}`);
});
exports.sendPaymentRejectedEmail = sendPaymentRejectedEmail;
const sendNotification = (userId, message) => __awaiter(void 0, void 0, void 0, function* () {
    return Promise.resolve();
});
exports.sendNotification = sendNotification;
