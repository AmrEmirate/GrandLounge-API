import { prisma } from "../config/prisma";
import OrderListRepositroy from "../repositories/orderList.repository";
import ApiError from "../utils/apiError";

class OrderListService {
  // private orderRepo: OrderListRepositroy;

  public async getOrderList(
    userId: string,
    filter: {
      searchQuery?: string;
      propertyName?: string;
      checkIn?: Date;
    }
  ) {
    const orderList = await OrderListRepositroy.findReservationByFilter(
      userId,
      filter
    );
    return orderList;
  }

  public async getTenantTransactions(
    tenantId: string,
    filter: {
      checkIn?: Date;
      searchQuery?: string;
      status?: any;
      propertyId?: string;
    }
  ) {
    const transactions =
      await OrderListRepositroy.findTransactionsByFilterForTenant(
        tenantId,
        filter
      );
    return transactions;
  }

  public async completeOrder(userId: string, bookingId: string) {
    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, userId: userId },
    });

    if (!booking)
      throw new ApiError(404, "Booking not found or you are not the owner.");
    if (booking.status !== "DIPROSES")
      throw new ApiError(400, "Only in-process bookings can be completed.");

    const updatedBooking = await OrderListRepositroy.updateBookingStatus(
      bookingId,
      "SELESAI"
    );
    return updatedBooking;
  }

  public async getPendingConfirmation(tenantId: string) {
    const transactions =
      await OrderListRepositroy.findPendingConfirmationForTenant(tenantId);
    return transactions;
  }
}

export default new OrderListService();
