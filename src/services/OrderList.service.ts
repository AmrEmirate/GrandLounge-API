
import { prisma } from "../config/prisma";
import OrderListRepositroy from "../repositories/OrderList.repositori";
import ApiError from "../utils/apiError";

export const OrderListService = async (userId: string, filter: {
    checkIn?: Date,
    checkOut?: Date,
    invoiceNumber?: string,
    status?: string,
    propertyName?: string;
}) => {
    const parsedFilter = {
        checkIn: filter.checkIn ? new Date(filter.checkIn) : undefined,
        checkOut: filter.checkOut ? new Date(filter.checkOut) : undefined,
        invoiceNumber: filter.invoiceNumber,
        status: filter.status,
        propertyName: filter.propertyName
    }

    const orderRepo = new OrderListRepositroy();
    const orderList = await orderRepo.findReservationByFilter(userId, parsedFilter);
    return orderList
}

export const getTenantTransactionListService = async (userId: string, status?: string) => {
    const tenant = await prisma.tenant.findUnique({
        where: { userId }, 
    });

    if (!tenant) {
        throw new Error("Tenant profile not found for this user.");
    }

    const tenantRepo = new OrderListRepositroy();
    const reservations = await tenantRepo.tenantTransactionList(tenant.id, status);
    return reservations;
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