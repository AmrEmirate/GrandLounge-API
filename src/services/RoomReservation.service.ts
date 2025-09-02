import { BookingStatus, RoomCategory } from "../generated/prisma";
import ReservationRepositori from "../repositories/RoomReservation.repositori";
import ApiError from "../utils/apiError";
import snap from "../config/midtrans";
import crypto from "crypto";
import { prisma } from "../config/prisma";

const reservationRepo = new ReservationRepositori();

// membuat reservasi kamar
export const createReservationService = async (
    propertyId: string,
    roomName: string,
    checkIn: Date,
    checkOut: Date,
    guestInfo: { name: string; email: string; password?: string },
    paymentMethod: string, // <-- Pastikan parameter ini ada
) => {
    if (checkOut <= checkIn) {
        throw new ApiError(400, "End date must be after start date");
    }

    const room = await reservationRepo.findRoomByName(propertyId, roomName);
    if (!room) {
        throw new ApiError(404, `Kamar dengan nama "${roomName}" tidak ditemukan di properti ini.`);
    }

    const user = await reservationRepo.findOrCreateAccount(guestInfo);

    const durationDays = Math.ceil((checkOut.getTime() - checkIn.getTime()) / 86_400_000);
    const totalPrice = room.basePrice * durationDays;
    const invoiceNumber = `INV-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

    const newBooking = await prisma.$transaction(async (tx) => {
        const isAvailable = await reservationRepo.checkRoomAvailability(room.id, checkIn, checkOut, tx);
        if (!isAvailable) {
            throw new ApiError(400, "Kamar ini tidak tersedia pada tanggal yang dipilih.");
        }

        const booking = await tx.booking.create({
            data: {
                invoiceNumber,
                checkIn: checkIn,
                checkOut: checkOut,
                totalPrice,
                status: BookingStatus.MENUNGGU_PEMBAYARAN,
                paymentDeadline: new Date(Date.now() + 1 * 60 * 60 * 1000),
                user: { connect: { id: user.id } },
                property: { connect: { id: room.propertyId } },
            },
        });

        await tx.bookingRoom.create({
            data: {
                bookingId: booking.id,
                roomId: room.id,
                guestCount: 1,
                pricePerNight: room.basePrice,
                numberOfNights: durationDays,
                totalPrice: totalPrice,
            },
        });

        return booking;
    });

    // --- LOGIKA PEMBAYARAN YANG DIPERBAIKI ---
    if (paymentMethod === 'gateway') {
        let transaction;
        try {
            transaction = await snap.createTransaction({
                transaction_details: {
                    order_id: newBooking.invoiceNumber,
                    gross_amount: newBooking.totalPrice,
                },
                customer_details: {
                    first_name: guestInfo.name,
                    email: guestInfo.email,
                },
            } as any);
        } catch (err) {
            await reservationRepo.updateTransaction(newBooking.id, { status: BookingStatus.DIBATALKAN });
            throw new ApiError(500, "Gagal membuat transaksi Midtrans");
        }

        const updatedBooking = await reservationRepo.updateTransaction(newBooking.id, {
            midtransOrderId: newBooking.invoiceNumber,
            paymentToken: transaction.token,
            paymentUrl: transaction.redirect_url,
        });

        return {
            ...updatedBooking,
            paymentUrl: transaction.redirect_url!,
            paymentToken: transaction.token!,
        };
    } else {
        // Jika metode pembayaran adalah 'manual' atau lainnya, langsung kembalikan data booking
        return newBooking;
    }
};

// dapat melihat semua reservasi milik pengguna
export const getUserReservationsService = async (userId: string) => {
    const reservation = await reservationRepo.findTransactionByAccountId(userId);
    return reservation;
};

// dapat melihat detaol reservasi berdasarkan Nama
export const getReservationByNameService = async (roomName: string, userId: string) => {
    const reservation = await reservationRepo.findTransactionByRoomName(roomName, userId);
    if (!reservation || reservation.userId !== userId) {
        throw new ApiError(404, `Reservasi untuk kamar dengan nama "${roomName}" tidak ditemukan.`);
    }
    return reservation;
};

// tenant dapat mengubah status reservasi
export const updateReservationStatusService = async (
    bookingId: string,
    newStatus: BookingStatus,
) => {
    return reservationRepo.updateTransaction(bookingId, { status: newStatus });
};