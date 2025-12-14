import { prisma } from "../config/prisma";
import { BookingStatus } from "@prisma/client";
import logger from "../utils/logger";

export const autoCancelBooking = async () => {
  try {
    const now = new Date();
    const pendingBookings = await prisma.booking.findMany({
      where: {
        status: BookingStatus.MENUNGGU_PEMBAYARAN,
        paymentDeadline: { lt: now },
      },
    });

    for (const booking of pendingBookings) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: BookingStatus.DIBATALKAN },
      });
      logger.info(
        `Booking ${booking.id} auto-cancelled due to expired paymentDeadline`
      );
    }
  } catch (err) {
    logger.error(`Auto-cancel booking failed: ${err}`);
  }
};
