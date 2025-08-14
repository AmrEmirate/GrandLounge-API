import { Prisma, BookingStatus } from "../generated/prisma";
import bcrypt from "bcrypt"
import crypto from "crypto";
import { prisma } from "../config/prisma";

export default class RoomReservationRepository {
    async checkRoomAvailability(roomId: number, newStartDate: Date, newEndDate: Date) {
        const existingBookings = await prisma.booking_Rooms.findMany({
            where: {
                room_id: roomId,
                booking: {
                    status: { in: [BookingStatus.SUDAH_DIBAYAR, BookingStatus.MENUNGGU_PEMBAYARAN] },
                    AND: [
                        { check_out: { gt: newStartDate } },
                        { check_in: { lt: newEndDate } }
                    ]
                }
            },
            include: { booking: true }
        });
        return existingBookings.length === 0;
    }

    async createTransaction(data: Prisma.BookingCreateInput) {
        return prisma.booking.create({ data });
    }

    async findRoomById(id: number) {
        return prisma.room.findUnique({
            where: { id },
            select: { id: true, property_id: true, basePrice: true },
        });
    }

    async findOrCreateAccount(userData: { email: string; name: string; password?: string }) {
        const raw = userData.password ?? crypto.randomBytes(8).toString("hex");
        const hashed = await bcrypt.hash(raw, 10);
        return prisma.user.upsert({
            where: { email: userData.email },
            update: { full_name: userData.name },
            create: {
                role: "USER",
                full_name: userData.name,
                email: userData.email,
                password: hashed,
            },
        });
    }

    async findTransactionByAccountId(userId: number) {
        return prisma.booking.findMany({
            where: { user_id: userId },
            include: {
                property: true,
                booking_rooms: { include: { room: true } },
            },
        });
    }

    async findTransactionById(bookingId: number) {
        return prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                user: true,
                property: true,
                booking_rooms: { include: { room: true } },
            },
        });
    }

    async updateTransaction(bookingId: number, data: Prisma.BookingUpdateInput) {
        return prisma.booking.update({
            where: { id: bookingId },
            data,
        });
    }
}

