
import { prisma } from "../config/prisma";
import OrderListRepositroy from "../repositories/OrderList.repositori";
import ApiError from "../utils/apiError";

export const OrderListService = async (
    userId: string,
    filter: {
        searchQuery?: string;
        propertyName?: string;
        checkIn?: Date;
    }
) => {
    try {
        const orderRepo = new OrderListRepositroy();

        const orderList = await orderRepo.findReservationByFilter(userId, filter);

        return orderList;
    } catch (error) {
        throw error;
    }
}

export const getTenantTransactionsService = async (
    tenantId: string,
    filter: {
        checkIn?: Date;
        searchQuery?: string;
        status?: any;
        propertyId?: string;
    }
) => {
    try {
        const orderRepo = new OrderListRepositroy();
        const transactions = await orderRepo.findTransactionsByFilterForTenant(tenantId, filter);
        return transactions;
    } catch (error) {
        throw error;
    }
};

export const completeOrderService = async (userId: string, bookingId: string) => {
    const orderRepo = new OrderListRepositroy();
    const booking = await prisma.booking.findFirst({
        where: { id: bookingId, userId: userId },
    });

    if (!booking) throw new ApiError(404, "Booking not found or you are not the owner.");
    if (booking.status !== "DIPROSES") throw new ApiError(400, "Only in-process bookings can be completed.");

    const updatedBooking = await orderRepo.updateBookingStatus(bookingId, "SELESAI");
    return updatedBooking;
};

export const getPendingConfirmationService = async (tenantId: string) => {
    try {
        const orderRepo = new OrderListRepositroy();
        const transactions = await orderRepo.findPendingConfirmationForTenant(tenantId);
        return transactions;
    } catch (error) {
        throw error;
    }
};