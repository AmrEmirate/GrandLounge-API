import { BookingStatus, RoomCategory } from "../generated/prisma";
import ReservationRepositori from "../repositories/RoomReservation.repositori";
import ApiError from "../utils/apiError";
import snap from "../config/midtrans";
import crypto from "crypto";
import { prisma } from "../config/prisma";

const reservationRepo = new ReservationRepositori();

// membuat reservasi kamar
export const createReservationService = async (
    propertyId: number,
    roomName: string,
    check_in: Date,
    check_out: Date,
    guestInfo: { name: string, email: string, password?: string },
) => {
    if (check_out <= check_in) {
        throw new ApiError(400, "End date must be after start date");
    }

    const room = await reservationRepo.findRoomByName(propertyId, roomName);
    if (!room) {
        throw new ApiError(404, `Kamar dengan nama "${roomName}" tidak ditemukan di properti ini.`);
    }

    const isAvailable = await reservationRepo.checkRoomAvailability(room.id, check_in, check_out);
    if (!isAvailable) {
        throw new ApiError(400, "Kamar ini tidak tersedia pada tanggal yang dipilih.");
    }

    const user = await reservationRepo.findOrCreateAccount(guestInfo);

    const durationDays = Math.ceil((check_out.getTime() - check_in.getTime()) / 86_400_000);
    const totalPrice = room.basePrice * durationDays;
    const invoiceNumber = `INV-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

    const newBooking = await prisma.$transaction(async (prisma) => {
        // 1. Buat entri Booking utama
        const booking = await prisma.booking.create({
            data: {
                invoiceNumber,
                checkIn: check_in,
                checkOut: check_out,
                totalPrice,
                status: BookingStatus.MENUNGGU_PEMBAYARAN,
                paymentDeadline: new Date(Date.now() + 1 * 60 * 60 * 1000),
                user: { connect: { id: user.id } },
                property: { connect: { id: room.propertyId } },
            },
        });

        // 2. Buat entri di BookingRooms untuk menghubungkan Booking dengan Room
        await prisma.bookingRoom.create({
            data: {
                bookingId: booking.id,
                roomId: room.id,
                guestCount: 1, // Atur sesuai kebutuhan Anda
                pricePerNight: room.basePrice,
                numberOfNights: durationDays,
                totalPrice: totalPrice,
            },
        });

        return booking;
    });

    let transaction;
    try {
        transaction = await snap.createTransaction({
            transaction_details: {
                order_id: invoiceNumber,
                gross_amount: totalPrice,
            },
            customer_details: {
                first_name: guestInfo.name,
                email: guestInfo.email,
            },
        } as any);
    } catch (err) {
        await reservationRepo.updateTransaction(newBooking.id, { status: BookingStatus.DIBATALKAN });
        throw new ApiError(500, "Failed to create Midtrans transaction");
    }

    const updatedBooking = await reservationRepo.updateTransaction(newBooking.id, {
        midtransOrderId: invoiceNumber,
        paymentToken: transaction.token,
        paymentUrl: transaction.redirect_url,
    });

    return {
        ...updatedBooking,
        paymentUrl: transaction.redirect_url!,
        paymentToken: transaction.token!,
    };
};

// dapat melihat semua reservasi milik pengguna
export const getUserReservationsService = async (accountId: number) => {
    const reservation = await reservationRepo.findTransactionByAccountId(accountId);
    return reservation;
};

// dapat melihat detaol reservasi berdasarkan Nama
export const getReservationByNameService = async (roomName: string) => {
    const reservation = await reservationRepo.findTransactionByRoomName(roomName);
    if (!reservation) {
        throw new ApiError(404, `Reservasi untuk kamar dengan nama "${roomName}" tidak ditemukan.`);
    }
    return reservation;
};

// tenant dapat mengubah status reservasi
export const updateReservationStatusService = async (
    bookingId: number,
    newStatus: BookingStatus,
) => {
    return reservationRepo.updateTransaction(bookingId, { status: newStatus });
};