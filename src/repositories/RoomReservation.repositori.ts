import { Prisma, BookingStatus } from "../generated/prisma";
import bcrypt from "bcrypt"
import crypto from "crypto";
import { prisma } from "../config/prisma";

export default class RoomReservationRepository {
    async checkRoomAvailability(roomId: number, newStartDate: Date, newEndDate: Date) {
        const existingBookings = await prisma.bookingRoom.findMany({
            where: {
                roomId: roomId,
                booking: {
                    status: { in: [BookingStatus.DIPROSES, BookingStatus.MENUNGGU_PEMBAYARAN] },
                    AND: [
                        { checkOut: { gt: newStartDate } },
                        { checkIn: { lt: newEndDate } }
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
            select: { id: true, propertyId: true, basePrice: true },
        });
    }

    async findOrCreateAccount(userData: { email: string; name: string; password?: string }) {
        const raw = userData.password ?? crypto.randomBytes(8).toString("hex");
        const hashed = await bcrypt.hash(raw, 10);
        return prisma.user.upsert({
            where: { email: userData.email },
            update: { fullName: userData.name },
            create: {
                role: "USER",
                fullName: userData.name,
                email: userData.email,
                password: hashed,
            },
        });
    }

    async findTransactionByAccountId(userId: number) {
        return prisma.booking.findMany({
            where: { userId: userId },
            include: {
                property: true,
                bookingRooms: { include: { room: true } },
            },
        });
    }

    async findTransactionById(bookingId: number) {
        return prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                property: {
                    include: {
                        city: true,       
                        category: true,
                    },
                },
                bookingRooms: {
                    include: { room: true },
                },
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

