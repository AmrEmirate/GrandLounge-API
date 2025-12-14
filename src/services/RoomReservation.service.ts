import { BookingStatus } from "@prisma/client";
import ReservationRepositori from "../repositories/roomReservation.repository";
import ApiError from "../utils/apiError";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../config/prisma";

class RoomReservationService {
  

  public async createReservation(
    propertyId: string,
    roomName: string,
    checkIn: Date,
    checkOut: Date,
    guestInfo: { name: string; email: string; password?: string }
  ) {
    if (checkOut <= checkIn) {
      throw new ApiError(400, "End date must be after start date");
    }

    const room = await ReservationRepositori.findRoomByName(
      propertyId,
      roomName
    );
    if (!room) {
      throw new ApiError(
        404,
        `Kamar dengan nama "${roomName}" tidak ditemukan di properti ini.`
      );
    }

    const user = await ReservationRepositori.findOrCreateAccount(guestInfo);

    const durationDays = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / 86_400_000
    );
    const totalPrice = room.basePrice * durationDays;
    const reservationId = uuidv4();
    const invoiceNumber = `INV-${Date.now()}-${crypto
      .randomBytes(4)
      .toString("hex")}`;

    const newBooking = await prisma.$transaction(async (tx) => {
      const isAvailable = await ReservationRepositori.checkRoomAvailability(
        room.id,
        checkIn,
        checkOut,
        tx
      );
      if (!isAvailable) {
        throw new ApiError(
          400,
          "Kamar ini tidak tersedia pada tanggal yang dipilih."
        );
      }

      const booking = await tx.booking.create({
        data: {
          invoiceNumber,
          reservationId,
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

    return newBooking;
  }

  public async getUserReservations(userId: string) {
    return await ReservationRepositori.findTransactionByAccountId(userId);
  }

  public async getReservationByName(roomName: string, userId: string) {
    const reservation = await ReservationRepositori.findTransactionByRoomName(
      roomName,
      userId
    );
    if (!reservation || reservation.userId !== userId) {
      throw new ApiError(
        404,
        `Reservasi untuk kamar dengan nama "${roomName}" tidak ditemukan.`
      );
    }
    return reservation;
  }

  public async updateReservationStatus(
    bookingId: string,
    newStatus: BookingStatus
  ) {
    return ReservationRepositori.updateTransaction(bookingId, {
      status: newStatus,
    });
  }
}

export default new RoomReservationService();
