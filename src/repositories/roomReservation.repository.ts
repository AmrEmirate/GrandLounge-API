import { Prisma, BookingStatus } from "@prisma/client";
import { prisma } from "../config/prisma";
import RoomAvailabilityRepository from "./roomAvailability.repository";

class RoomReservationRepository {
  async createTransaction(data: Prisma.BookingCreateInput) {
    return prisma.booking.create({ data });
  }

  async findRoomByName(propertyId: string, name: string) {
    return await prisma.room.findFirst({
      where: {
        propertyId: propertyId,
        name: name,
      },
      select: { id: true, propertyId: true, basePrice: true },
    });
  }

  async findRoomById(id: string) {
    return await prisma.room.findUnique({
      where: { id },
      select: { id: true, propertyId: true, basePrice: true },
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
      const isAvailable =
        await RoomAvailabilityRepository.checkRoomAvailability(
          room.id,
          checkIn,
          checkOut,
          prisma
        );
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
    const bookingRoomsDataToCreate = availableRooms.map((room) => {
      const totalPrice = numberOfNights * room.basePrice;
      calculatedTotalPrice += totalPrice;
      return {
        roomId: room.id,
        guestCount: 1,
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
          paymentDeadline: new Date(Date.now() + 1 * 60 * 60 * 1000),
          bookingRooms: {
            createMany: {
              data: bookingRoomsDataToCreate,
            },
          },
        },
        include: { bookingRooms: true },
      });

      return booking;
    });

    return prisma.booking.findMany({
      where: { id: transactionResult.id },
      include: { bookingRooms: { include: { room: true } }, property: true },
    });
  }
}

export default new RoomReservationRepository();
