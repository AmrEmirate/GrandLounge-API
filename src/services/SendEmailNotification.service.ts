import nodemailer from "nodemailer";
import { Booking, User, Property } from "../generated/prisma";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// Email konfirmasi booking
export const sendBookingConfirmEmail = async (
    booking: Booking & { user: User; property: Property }
) => {
    await transporter.sendMail({
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
};

// Email reminder H-1 check-in
export const sendCheckinReminderEmail = async (
    booking: Booking & { user: User; property: Property }
) => {
    await transporter.sendMail({
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
};
