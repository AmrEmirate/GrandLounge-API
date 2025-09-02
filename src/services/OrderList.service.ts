import { use } from "passport";
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