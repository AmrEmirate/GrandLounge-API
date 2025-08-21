import { prisma } from "../config/prisma";
import OrderListRepositroy from "../repositories/OrderList.repositori";
import ApiError from "../utils/apiError";

export const OrderListService = async (accountId: number, filter: {
    checkIn?: Date,
    checkOut?: Date,
    invoiceNumber?: string,
    status?: string
}) => {
    const parsedFilter = {
        checkIn: filter.checkIn ? new Date(filter.checkIn) : undefined,
        checkOut: filter.checkOut ? new Date(filter.checkOut) : undefined,
        invoiceNumber: filter.invoiceNumber,
        status: filter.status
    }

    const orderRepo = new OrderListRepositroy();
    const orderList = await orderRepo.findReservationByFilter(accountId, parsedFilter);
    return orderList
}

export const getTenantReservationService = async (userId: number, status?: string) => {
    const tenant = await prisma.tenant.findUnique({
        where: { userId: userId },
    });

    if (!tenant) {
        throw new Error("Tenant profile not found for this user.");
    }
    
    const tenantRepo = new OrderListRepositroy();
    const reservations = await tenantRepo.tenantTransactionList(tenant.id, status);
    return reservations;
};