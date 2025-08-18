import { prisma } from "../config/prisma";
import { BookingStatus } from "../generated/prisma";

export default class CancelOrderRepository {
    async findBookingById(bookingId: number) {
        return prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                user: true, // Sertakan data user
                property: { // Sertakan data properti
                    include: {
                        tenant: true, // Sertakan data tenant dari properti
                    },
                },
            },
        });
    }

    // Fungsi yang Anda berikan, untuk mengubah status.
    // Fungsi ini akan dipanggil setelah validasi di service berhasil.
    async updateBookingStatus(bookingId: number, newStatus: BookingStatus) {
        return prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: newStatus
            }
        })
    }
}