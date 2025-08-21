// src/services/SendEmailNotification.service.ts
import nodemailer from 'nodemailer';
import { Booking, User, Property } from '../generated/prisma';

// Fungsi untuk mengirim email konfirmasi pemesanan
export const sendBookingConfirmEmail = async (booking: Booking & { user: User; property: Property }) => {
    // Implementasi pengiriman email
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: booking.user.email,
        subject: 'Pemesanan Anda Telah Dikonfirmasi',
        html: `
            <h1>Detail Pemesanan</h1>
            <p>Pemesanan Anda untuk properti **${booking.property.name}** telah dikonfirmasi.</p>
            <p><strong>Tanggal Check-in:</strong> ${booking.checkIn.toDateString()}</p>
            <p><strong>Tanggal Check-out:</strong> ${booking.checkOut.toDateString()}</p>
            <h2>Aturan Properti:</h2>
            <p>${booking.property.description || 'Tidak ada aturan properti yang ditetapkan.'}</p>
        `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email konfirmasi dikirim ke ${booking.user.email}`);
};

// Fungsi untuk mengirim pengingat H-1 check-in
export const sendCheckinReminderEmail = async (booking: Booking & { user: User; property: Property }) => {
    // Implementasi pengiriman email pengingat
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: booking.user.email,
        subject: 'Pengingat Check-in Besok!',
        html: `
            <h1>Pengingat Check-in</h1>
            <p>Hai ${booking.user.fullName},</p>
            <p>Ini adalah pengingat bahwa Anda akan melakukan check-in di **${booking.property.name}** besok pada tanggal ${booking.checkIn.toDateString()}.</p>
            <h2>Aturan Properti:</h2>
            <p>${booking.property.description || 'Tidak ada aturan properti yang ditetapkan.'}</p>
        `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email pengingat dikirim ke ${booking.user.email}`);
};