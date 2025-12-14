import { snap } from "../config/midtrans.config";
import { prisma } from "../config/prisma";
import { BookingStatus } from "@prisma/client";
import ApiError from "../utils/apiError";
import crypto from "crypto";

class PaymentService {
  public async createTransaction(bookingId: string, userId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        property: true,
        bookingRooms: {
          include: {
            room: true,
          },
        },
      },
    });

    if (!booking) throw new ApiError(404, "Booking tidak ditemukan.");
    if (booking.userId !== userId) throw new ApiError(403, "Akses ditolak.");
    if (booking.status !== BookingStatus.MENUNGGU_PEMBAYARAN)
      throw new ApiError(
        400,
        "Booking tidak dalam status menunggu pembayaran."
      );

    
    if (new Date() > new Date(booking.paymentDeadline)) {
      
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.DIBATALKAN },
      });
      throw new ApiError(
        400,
        "Waktu pembayaran telah habis. Booking dibatalkan."
      );
    }

    const parameter = {
      transaction_details: {
        order_id: booking.invoiceNumber, 
        gross_amount: booking.totalPrice,
      },
      customer_details: {
        first_name: booking.user.fullName,
        email: booking.user.email,
      },
      item_details: booking.bookingRooms.map((br) => ({
        id: br.roomId,
        price: br.pricePerNight,
        quantity: br.numberOfNights, 
        
        
        name: `Sewa Room ${br.room.name} (${br.numberOfNights} Malam)`,
      })),
      callbacks: {
        finish: `${process.env.FE_URL}/user/orders`, 
      },
    };

    try {
      const transaction = await snap.createTransaction(parameter);
      return transaction;
    } catch (error: any) {
      throw new ApiError(
        500,
        "Gagal membuat transaksi Midtrans: " + error.message
      );
    }
  }

  public async midtransWebhook(notification: any) {
    const statusResponse = await (snap as any).transaction.notification(
      notification
    );
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    console.log(
      `Transaction notification received. Order ID: ${orderId}. Transaction Status: ${transactionStatus}. Fraud Status: ${fraudStatus}`
    );

    const booking = await prisma.booking.findFirst({
      where: { invoiceNumber: orderId },
    });

    if (!booking) {
      console.error(`Booking with Invoice Number ${orderId} not found.`);
      return;
    }

    
    if (transactionStatus == "capture") {
      if (fraudStatus == "challenge") {
        
      } else if (fraudStatus == "accept") {
        await this.updateBookingStatus(booking.id, BookingStatus.DIPROSES);
      }
    } else if (transactionStatus == "settlement") {
      await this.updateBookingStatus(booking.id, BookingStatus.DIPROSES);
    } else if (
      transactionStatus == "cancel" ||
      transactionStatus == "deny" ||
      transactionStatus == "expire"
    ) {
      await this.updateBookingStatus(booking.id, BookingStatus.DIBATALKAN);
    } else if (transactionStatus == "pending") {
      
    }
  }

  private async updateBookingStatus(bookingId: string, status: BookingStatus) {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });
  }
}

export default new PaymentService();
