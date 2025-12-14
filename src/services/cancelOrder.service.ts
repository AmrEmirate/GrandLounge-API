import { prisma } from "../config/prisma";
import CancelOrderRepository from "../repositories/cancelOrder.repository";
import ApiError from "../utils/apiError";

class CancelOrderService {
  

  public async cancelOrder(
    invoiceNumber: string,
    userId: string,
    isTenant: boolean
  ) {
    const booking = await CancelOrderRepository.findBookingById(invoiceNumber);

    if (!booking) {
      throw new ApiError(404, "Pesanan tidak di temukan");
    }

    let authorized = false;

    if (booking.userId === userId) {
      authorized = true;
    }

    if (isTenant) {
      const tenant = await prisma.tenant.findUnique({
        where: { userId: userId },
        select: { id: true },
      });

      if (tenant && booking.property.tenantId === tenant.id) {
        authorized = true;
      }
    }

    if (!authorized) {
      throw new ApiError(
        403,
        "Anda tidak memiliki izin untuk membatalkan pesanan ini."
      );
    }
    if (
      booking.status !== "MENUNGGU_PEMBAYARAN" &&
      booking.status !== "MENUNGGU_KONFIRMASI"
    ) {
      throw new ApiError(400, "Pesanan ini tidak dapat dibatalkan.");
    }

    const cancelOrder = await CancelOrderRepository.updateBookingStatus(
      invoiceNumber,
      "DIBATALKAN"
    );
    return cancelOrder;
  }
}

export default new CancelOrderService();
