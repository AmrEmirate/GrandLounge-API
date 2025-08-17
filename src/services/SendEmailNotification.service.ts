import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
})

export const sendNotification = async (userId: number, message: string) => {
    try {
        console.log(`Sending notification to user ${userId}: ${message}`);
    } catch (error) {
        console.error("Failed to send notification:", error)
    }
}

export const sendBookingConfirmEmail = async (booking: any) => {
    const mailOptions = {
        from: `"Grand Loungue" <${process.env.EMAIL_USER}>`,
        to: booking.userEmail,
        subject: "Booking Confirmation - Hotel XYZ",
        text: `Hello ${booking.userName},\n\nYour booking has been confirmed!\n\nDetails:\n- Room: ${booking.roomName}\n- Check-in: ${booking.startDate}\n- Check-out: ${booking.endDate}\n- Total Price: Rp${booking.totalPrice}\n\nWe look forward to your stay!`,
        html: `
          <h2>Booking Confirmation</h2>
          <p>Hello <b>${booking.userName}</b>,</p>
          <p>Your booking has been confirmed! 🎉</p>
          <ul>
            <li><b>Room:</b> ${booking.roomName}</li>
            <li><b>Check-in:</b> ${booking.startDate}</li>
            <li><b>Check-out:</b> ${booking.endDate}</li>
            <li><b>Total Price:</b> Rp${booking.totalPrice}</li>
          </ul>
          <p>We look forward to your stay at <b>Hotel XYZ</b>!</p>
        `,
    }

    await transporter.sendMail(mailOptions)
}

export const sendCheckinReminderEmail = async (booking: any) => {
    const mailOptions = {
        from: `"Grand Loungue" <${process.env.EMAIL_USER}>`,
        to: booking.userEmail,
        subject: "Reminder: Your Check-in is Tomorrow!",
        text: `Hello ${booking.userName},\n\nThis is a friendly reminder that your check-in is scheduled for tomorrow.\n\nDetails:\n- Room: ${booking.roomName}\n- Check-in: ${booking.startDate}\n- Check-out: ${booking.endDate}\n\nWe look forward to welcoming you!`,
        html: `
          <h2>Check-in Reminder</h2>
          <p>Hello <b>${booking.userName}</b>,</p>
          <p>Just a reminder that your check-in is <b>tomorrow</b> 🏨</p>
          <ul>
            <li><b>Room:</b> ${booking.roomName}</li>
            <li><b>Check-in:</b> ${booking.startDate}</li>
            <li><b>Check-out:</b> ${booking.endDate}</li>
          </ul>
          <p>We look forward to welcoming you at <b>Hotel XYZ</b>!</p>
        `,
    }

    await transporter.sendMail(mailOptions)
}
