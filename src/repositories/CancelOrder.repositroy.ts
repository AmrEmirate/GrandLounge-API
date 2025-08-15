import { prisma } from "../config/prisma"

export default class CancelOrderRepository {
    async cancelOrder(bookingId: number) {
        return prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: "DIBATALKAN"
            }
        })
    }
}