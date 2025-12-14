import nodemailer from "nodemailer";
import { Booking, User, Property } from "@prisma/client";
import logger from "../utils/logger";

class EmailNotificationService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
  }

  public async sendBookingConfirmEmail(
    booking: Booking & { user: User; property: Property }
  ) {
    await this.transporter.sendMail({
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
    logger.info(`Email konfirmasi dikirim ke ${booking.user.email}`);
  }

  public async sendCheckinReminderEmail(
    booking: Booking & { user: User; property: Property }
  ) {
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: booking.user.email,
      subject: "Pengingat Check-in Besok",
      html: `
        <h1>Pengingat Check-in</h1>
        <p>Hai ${booking.user.fullName},</p>
        <p>Besok Anda akan check-in di properti <b>${
          booking.property.name
        }</b>.</p>
        <p>Check-in: ${booking.checkIn.toDateString()}</p>
        <p>Check-out: ${booking.checkOut.toDateString()}</p>
        <h2>Aturan Properti</h2>
        <p>${booking.property.description || "Tidak ada aturan properti."}</p>
      `,
    });
    logger.info(`Email reminder dikirim ke ${booking.user.email}`);
  }

  public async sendPaymentRejectedEmail(booking: Booking & { user: User }) {
    await this.transporter.sendMail({
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
    logger.info(`Email penolakan pembayaran dikirim ke ${booking.user.email}`);
  }

  public async sendNotification(userId: string, message: string) {
    return Promise.resolve();
  }
}

export default new EmailNotificationService();
