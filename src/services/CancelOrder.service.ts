import CancelOrderRepository from "../repositories/CancelOrder.repositroy";
import ApiError from "../utils/apiError";

const cancelOrderRepo = new CancelOrderRepository();

export const CancelOrderService = async (bookingId: number, userId: number, isTenant: boolean) => {

    const booking = await cancelOrderRepo.findBookingById(bookingId);

    if (!booking) {
        throw new ApiError(404, "Pesanan tidak di temukan")
    }

    // Validasi otorisasi
    if (booking.userId !== userId && (!isTenant || booking.property.tenantId !== userId)) {
        throw new ApiError(403, "Anda tidak memiliki izin untuk membatalkan pesanan ini.")
    }

    // Validasi status
    if (booking.status !== "MENUNGGU_PEMBAYARAN" && booking.status !== "MENUNGGU_KONFIRMASI") {
        throw new ApiError(400, "Pesanan ini tidak dapat dibatalkan.");
    }


    const cancelOrder = await cancelOrderRepo.updateBookingStatus(bookingId, "DIBATALKAN");
    return cancelOrder;
}