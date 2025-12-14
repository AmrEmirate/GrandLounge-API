import cron from "node-cron";
import { prisma } from "../config/prisma";
import { BookingStatus } from "@prisma/client";
import logger from "../utils/logger";

export const startBookingCancellationScheduler = () => {
  cron.schedule("*/30 * * * *", async () => {
    logger.info("Running booking cancellation job...");
    const now = new Date();

    try {
      const expiredBookings = await prisma.booking.findMany({
        where: {
          status: BookingStatus.MENUNGGU_PEMBAYARAN,
          paymentDeadline: { lt: now },
        },
      });

      if (expiredBookings.length > 0) {
        const result = await prisma.booking.updateMany({
          where: { id: { in: expiredBookings.map((b) => b.id) } },
          data: { status: BookingStatus.DIBATALKAN },
        });
        logger.info(`${result.count} bookings cancelled automatically.`);
      }
    } catch (error) {
      logger.error(`Error in booking cancellation job: ${error}`);
    }
  });
};
