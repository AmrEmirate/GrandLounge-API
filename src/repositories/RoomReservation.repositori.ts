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

    async createReservationWithRooms(
        userId: number,
        propertyId: number,
        checkIn: Date,
        checkOut: Date,
        totalPrice: number,
        roomCount: number
    ) {
        const rooms = await prisma.room.findMany({
            where: { propertyId }
        });

        const availableRooms: number[] = [];
        for (const room of rooms) {
            const isAvailable = await this.checkRoomAvailability(room.id, checkIn, checkOut);
            if (isAvailable) availableRooms.push(room.id);
            if (availableRooms.length >= roomCount) break; // cukup jumlah kamar yang dibutuhkan
        }

        if (availableRooms.length < roomCount) {
            throw new Error("Tidak cukup kamar tersedia untuk tanggal yang dipilih");
        }

        const booking = await prisma.booking.create({
            data: {
                userId,
                propertyId,
                checkIn,
                checkOut,
                totalPrice,
                status: BookingStatus.MENUNGGU_PEMBAYARAN,
                invoiceNumber: `INV-${Date.now()}`,
                paymentDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
        });

        const numberOfNights = Math.ceil(
            (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
        );

        const bookingRoomsData = [];

        for (const roomId of availableRooms) {
            const room = await this.findRoomById(roomId);
            const pricePerNight = room?.basePrice ?? 0;
            const totalPrice = numberOfNights * pricePerNight;

            bookingRoomsData.push({
                bookingId: booking.id,
                roomId,
                guestCount: 1,
                pricePerNight,
                numberOfNights,
                totalPrice,
            });
        }

        await prisma.bookingRoom.createMany({ data: bookingRoomsData });

        return prisma.booking.findUnique({
            where: { id: booking.id },
            include: { bookingRooms: { include: { room: true } }, property: true },
        });

    }
    async getAvailableRooms(propertyId: number, checkIn: Date, checkOut: Date) {
        const rooms = await prisma.room.findMany({ where: { propertyId } });
        const availableRooms: number[] = [];

        for (const room of rooms) {
            const isAvailable = await this.checkRoomAvailability(room.id, checkIn, checkOut);
            if (isAvailable) availableRooms.push(room.id);
        }

        return availableRooms;
    }

}

