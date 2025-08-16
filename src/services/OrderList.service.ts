import OrderListRepositroy from "../repositories/OrderList.repositori";
import ApiError from "../utils/apiError";

export const OrderListService = async (accountId: number, filter: {
    checkIn?: Date,
    checkOut?: Date,
    invoiceNumber?: string
}) => {
    const parsedFilter = {
        checkIn : filter.checkIn ? new Date(filter.checkIn) : undefined,
        checkOut : filter.checkOut ? new Date(filter.checkOut) : undefined,
        invoiceNumber: filter.invoiceNumber,
    }

    const orderRepo = new OrderListRepositroy();

    const orderList = await orderRepo.findReservationByFilter(accountId, parsedFilter);
    return orderList
}

export const getTenantReservationService = async (tenantId: number, status?: string) => {
    if (status) {
        throw new ApiError(400, "Tenant ID is required");
    };

    const tenantRepo = new OrderListRepositroy();
    const reservations = await tenantRepo.tenantTransactionList(tenantId, status);
    return reservations;
}