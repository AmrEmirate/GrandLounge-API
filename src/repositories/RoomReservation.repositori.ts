import { Prisma, BookingStatus, PrismaClient } from "../generated/prisma";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { prisma } from "../config/prisma";
import { DefaultArgs } from "../generated/prisma/runtime/library";
import { eachDayOfInterval } from 'date-fns';

export default class RoomReservationRepository {
    async checkRoomAvailability(roomId: string, newStartDate: Date, newEndDate: Date, tx: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends">) {
        const existingBookings = await tx.bookingRoom.count({
            where: {
                roomId: roomId,
                booking: {
                    status: { in: [BookingStatus.MENUNGGU_PEMBAYARAN, BookingStatus.DIPROSES] },
                    checkOut: { gt: newStartDate },
                    checkIn: { lt: newEndDate }
                }
            }
        });

        if (existingBookings > 0) {
            return false; 
        }

        const datesInRange = eachDayOfInterval({ start: newStartDate, end: new Date(newEndDate.getTime() - 1) });
        
        const unavailableDatesCount = await tx.roomAvailability.count({
            where: {
                roomId: roomId,
                date: { in: datesInRange },
                isAvailable: false 
            }
        });
        return unavailableDatesCount === 0;
    }


    async createTransaction(data: Prisma.BookingCreateInput) {
        return prisma.booking.create({ data });
    }

    async findRoomByName(propertyId: string, name: string) {
        return prisma.room.findFirst({
            where: {
                propertyId: propertyId,
                name: name
            },
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

    async findTransactionByAccountId(userId: string) {
        return prisma.booking.findMany({
            where: { userId: userId },
            include: {
                property: true,
                bookingRooms: { include: { room: true } },
            },
        });
    }

    async findTransactionByRoomName(roomName: string, userId: string) {
        return prisma.booking.findFirst({
            where: {
                userId,
                bookingRooms: {
                    some: {
                        room: {
                            name: roomName,
                        },
                    },
                },
            },
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

    async updateTransaction(bookingId: string, data: Prisma.BookingUpdateInput) {
        return prisma.booking.update({
            where: { id: bookingId },
            data,
        });
    }

    async createReservationWithRooms(
        userId: string,
        propertyId: string,
        checkIn: Date,
        checkOut: Date,
        roomCount: number
    ) {
        const rooms = await prisma.room.findMany({ where: { propertyId } });
        const availableRooms: { id: string; basePrice: number }[] = [];

        for (const room of rooms) {
            const isAvailable = await this.checkRoomAvailability(room.id, checkIn, checkOut, prisma);
            if (isAvailable) {
                availableRooms.push({ id: room.id, basePrice: room.basePrice });
            }
            if (availableRooms.length >= roomCount) break;
        }

        if (availableRooms.length < roomCount) {
            throw new Error("Tidak cukup kamar tersedia untuk tanggal yang dipilih");
        }

        const numberOfNights = Math.ceil(
            (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
        );

        let calculatedTotalPrice = 0;
        const bookingRoomsDataToCreate = availableRooms.map(room => {
            const totalPrice = numberOfNights * room.basePrice;
            calculatedTotalPrice += totalPrice;
            return {
                roomId: room.id,
                guestCount: 1, // Asumsi 1 tamu per kamar
                pricePerNight: room.basePrice,
                numberOfNights,
                totalPrice: totalPrice,
            };
        });

        const transactionResult = await prisma.$transaction(async (prisma) => {
            const booking = await prisma.booking.create({
                data: {
                    userId,
                    propertyId,
                    checkIn,
                    checkOut,
                    totalPrice: calculatedTotalPrice,
                    status: BookingStatus.MENUNGGU_PEMBAYARAN,
                    invoiceNumber: `INV-${Date.now()}`,
                    paymentDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
                    bookingRooms: {
                        createMany: {
                            data: bookingRoomsDataToCreate,
                        },
                    },
                },
                include: { bookingRooms: true }, // Sertakan data yang baru dibuat
            });

            return booking;
        });

        return prisma.booking.findMany({
            where: { id: transactionResult.id },
            include: { bookingRooms: { include: { room: true } }, property: true },
        });
    }


    async getAvailableRooms(propertyId: string, checkIn: Date, checkOut: Date) {
        const rooms = await prisma.room.findMany({ where: { propertyId } });
        const availableRooms: string[] = [];

        for (const room of rooms) {
            const isAvailable = await this.checkRoomAvailability(room.id, checkIn, checkOut, prisma);
            if (isAvailable) availableRooms.push(room.id);
        }

        return availableRooms;
    }
}