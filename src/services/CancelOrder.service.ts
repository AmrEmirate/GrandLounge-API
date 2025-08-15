import CancelOrderRepository from "../repositories/CancelOrder.repositroy";
import ApiError from "../utils/apiError";

export const CancelOrderService = async (bookingId: number) => {
    const cancelOrderRepo = new CancelOrderRepository(); 

    const result = await cancelOrderRepo.cancelOrder(bookingId);

    if (!result) {
        throw new ApiError(404, "Transaction not found.");
    }

    if (result.status !== "DIBATALKAN") {
        throw new ApiError(400, "Cannot cancel this transaction")
    }

    const cancelOrder = await cancelOrderRepo.cancelOrder(bookingId);
    return cancelOrder;
}