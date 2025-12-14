import { BookingStatus } from "@prisma/client";
import ConfirmPaymentRepository from "../repositories/confirmPayment.repository";
import ApiError from "../utils/apiError";
import { prisma } from "../config/prisma";
import EmailNotificationService from "./sendEmailNotification.service";

class ConfirmPaymentService {
  public async confirmPayment(
    tenantId: string,
    invoiceNumber: string,
    isAccepted: boolean
  ) {
    const updatedBooking = await prisma.$transaction(async (tx) => {
      
      const booking = await ConfirmPaymentRepository.findBookingByInvoice(
        invoiceNumber,
        tx
      );

      if (!booking) {
        throw new ApiError(404, "Booking not found");
      }

      if (booking.property.tenantId !== tenantId) {
        throw new ApiError(
          403,
          "You do not have permission to confirm this payment."
        );
      }

      if (
        booking.status !== "MENUNGGU_PEMBAYARAN" &&
        booking.status !== "MENUNGGU_KONFIRMASI"
      ) {
        throw new ApiError(
          400,
          "This booking cannot be canceled at its current status."
        );
      }

      let newStatus: BookingStatus;
      if (isAccepted) {
        newStatus = BookingStatus.DIPROSES;
      } else {
        newStatus = BookingStatus.MENUNGGU_PEMBAYARAN;
      }

      const result = await ConfirmPaymentRepository.updateBookingStatus(
        booking.id,
        newStatus,
        tx
      );

      if (!isAccepted) {
        await ConfirmPaymentRepository.clearPaymentProof(booking.id, tx);
      }

      return result;
    });

    try {
      if (isAccepted) {
        const message =
          "Pembayaran Anda telah diterima. Pemesanan Anda sedang diproses.";
        await EmailNotificationService.sendNotification(
          updatedBooking.userId,
          message
        );
        await EmailNotificationService.sendBookingConfirmEmail(updatedBooking);
      } else {
        const message =
          "Pembayaran Anda ditolak. Silakan upload ulang bukti pembayaran.";
        await EmailNotificationService.sendNotification(
          updatedBooking.userId,
          message
        );
        await EmailNotificationService.sendPaymentRejectedEmail(updatedBooking);
      }
    } catch (error) {
      throw new ApiError(
        500,
        `Gagal mengirim notifikasi untuk booking ${updatedBooking.id}:`
      );
    }

    return updatedBooking;
  }
}

export default new ConfirmPaymentService();
