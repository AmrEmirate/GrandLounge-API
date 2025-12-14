import { prisma } from "../config/prisma";
import { PrismaClient, BookingStatus } from "@prisma/client";

type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

class ConfirmPaymentRepository {
  async findBookingByInvoice(
    invoiceNumber: string,
    tx: PrismaTransactionClient = prisma
  ) {
    return tx.booking.findFirst({
      where: { invoiceNumber },
      include: { property: true },
    });
  }

  async updateBookingStatus(
    bookingId: string,
    newStatus: BookingStatus,
    tx: PrismaTransactionClient = prisma
  ) {
    return tx.booking.update({
      where: { id: bookingId },
      data: { status: newStatus },
      include: { property: true, user: true },
    });
  }

  async clearPaymentProof(
    bookingId: string,
    tx: PrismaTransactionClient = prisma
  ) {
    return tx.booking.update({
      where: { id: bookingId },
      data: { paymentProof: null },
    });
  }
}

export default new ConfirmPaymentRepository();
