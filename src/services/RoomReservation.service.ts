import { BookingStatus, RoomCategory } from "../generated/prisma";
import ReservationRepositori from "../repositories/RoomReservation.repositori";
import ApiError from "../utils/apiError";

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
        invoiceNumber: invoiceNumber,
        checkIn: check_in,
        checkOut: check_out,
        totalPrice: totalPrice,
        status: BookingStatus.MENUNGGU_PEMBAYARAN,
        paymentDeadline: new Date(Date.now() + 1 * 60 * 60 * 1000),
        // paymentDeadline: new Date(Date.now() + 15 * 1000), // testing
        user: { connect: { id: user.id } },
        property: { connect: { id: room.propertyId } },
    });


    return newBooking;
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