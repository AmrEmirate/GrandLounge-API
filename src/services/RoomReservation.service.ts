import { BookingStatus, RoomCategory } from "../generated/prisma";
import ReservationRepositori from "../repositories/RoomReservation.repositori";
import ApiError from "../utils/apiError";
import snap from "../config/midtrans";

const reservationRepo = new ReservationRepositori();

// membuat reservasi kamar
export const createReservationService = async (
    roomId: number,
    check_in: Date,
    check_out: Date,
    guestInfo: { name: string, email: string, password: string },
) => {
    if (check_out <= check_in) {
        throw new ApiError(400, "End date must be after start date");
    }

    const room = await reservationRepo.findRoomById(roomId);
    if (!room) {
        throw new ApiError(404, "Room not found");
    }

    const isAvailable = await reservationRepo.checkRoomAvailability(roomId, check_in, check_out);
    if (!isAvailable) {
        throw new ApiError(400, "Room is not available for the selected dates");
    }

    const user = await reservationRepo.findOrCreateAccount(guestInfo);

    const durationDays = Math.ceil((check_out.getTime() - check_in.getTime()) / 86_400_000);
    const totalPrice = room.basePrice * durationDays;

    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    const newBooking = await reservationRepo.createTransaction({
        invoiceNumber,
        checkIn: check_in,
        checkOut: check_out,
        totalPrice,
        status: BookingStatus.MENUNGGU_PEMBAYARAN,
        paymentDeadline: new Date(Date.now() + 1 * 60 * 60 * 1000),
        user: { connect: { id: user.id } },
        property: { connect: { id: room.propertyId } },
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

    await reservationRepo.updateTransaction(newBooking.id, {
        midtransOrderId: invoiceNumber, // menggunakan invoiceNumber sebagai order_id
        paymentToken: transaction.token,
        paymentUrl: transaction.redirect_url,
    });

    return {
        ...newBooking,
        paymentUrl: transaction.redirect_url!,
        paymentToken: transaction.token!,
    };
};

// dapat melihat semua reservasi milik pengguna
export const getUserReservationsService = async (accountId: number) => {
    const reservation = await reservationRepo.findTransactionByAccountId(accountId);
    return reservation;
};

// dapat melihat detaol reservasi berdasarkan ID
export const getReservationByIdService = async (transactionId: number) => {
    const reservation = await reservationRepo.findTransactionById(transactionId);
    return reservation;
};

// tenant dapat mengubah status reservasi
export const updateReservationStatusService = async (
    bookingId: number,
    newStatus: BookingStatus,
) => {
    return reservationRepo.updateTransaction(bookingId, { status: newStatus });
};