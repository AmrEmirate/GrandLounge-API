import OrderListRepositroy from "../repositories/OrderList.repositori";

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