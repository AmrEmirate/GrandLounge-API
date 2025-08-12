import { TransactionStatus } from "../generated/prisma";
import ReservationRepositori from "../repositories/RoomReservation.repositori";
import ApiError from "../utils/apiError";

const reservationRepo = new ReservationRepositori();

export const createReservationService = async (
    roomId: number,
    startDate: Date,
    endDate: Date,
    guestInfo: { name: string, email: string, password: string },
) => {
    if (endDate <= startDate) {
        throw new ApiError(400, "End date must be after start date");
    }

    const room = await reservationRepo.findRoomById(roomId);
    if (!room) {
        throw new ApiError(404, "Room not found");
    }

    const isAvailable = await reservationRepo.checkRoomAvailability(roomId, startDate, endDate);
    if (!isAvailable) {
        throw new ApiError(400, "Room is not available for the selected dates");
    }

    const user = await reservationRepo.findOrCreateAccount(guestInfo);

    const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
    const totalPrice = room.basePrice * duration;

    const status: TransactionStatus = "MENUNGGU_PEMBAYARAN";

    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newTransaction = await reservationRepo.createTransaction({
        invoiceNumber,
        startDate,
        endDate,
        totalPrice,
        status,
        room: { connect: { id: room.id } },
        account: { connect: { id: user.id } },
    });

    return newTransaction;
};