import { prisma } from "../config/prisma";
import CancelOrderRepository from "../repositories/CancelOrder.repositroy";
import ApiError from "../utils/apiError";

const cancelOrderRepo = new CancelOrderRepository();

export const CancelOrderService = async (bookingId: number, userId: number, isTenant: boolean) => {

    const booking = await cancelOrderRepo.findBookingById(bookingId);

    if (!booking) {
        throw new ApiError(404, "Pesanan tidak di temukan")
    }

    let authorized = false;

    if (booking.userId === userId) {
        authorized = true;
    }

    if (isTenant) {
        // Cari tenantId yang terkait dengan userId
        const tenant = await prisma.tenant.findUnique({
            where: { userId: userId },
            select: { id: true }
        });

        if (tenant && booking.property.tenantId === tenant.id) {
            authorized = true;
        }
    }

    if (!authorized) {
        throw new ApiError(403, "Anda tidak memiliki izin untuk membatalkan pesanan ini.");
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