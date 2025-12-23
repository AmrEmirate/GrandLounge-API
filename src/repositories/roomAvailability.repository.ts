import { Prisma, BookingStatus, PrismaClient } from "@prisma/client";
import { prisma } from "../config/prisma";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { eachDayOfInterval } from "date-fns";

class RoomAvailabilityRepository {
  async checkRoomAvailability(
    roomId: string,
    newStartDate: Date,
    newEndDate: Date,
    tx: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
    >
  ) {
    const existingBookings = await tx.bookingRoom.count({
      where: {
        roomId: roomId,
        booking: {
          status: {
            in: [BookingStatus.MENUNGGU_PEMBAYARAN, BookingStatus.DIPROSES],
          },
          checkOut: { gt: newStartDate },
          checkIn: { lt: newEndDate },
        },
      },
    });

    if (existingBookings > 0) {
      return false;
    }

    const datesInRange = eachDayOfInterval({
      start: newStartDate,
      end: new Date(newEndDate.getTime() - 1),
    });

    const unavailableDatesCount = await tx.roomAvailability.count({
      where: {
        roomId: roomId,
        date: { in: datesInRange },
        isAvailable: false,
      },
    });
    return unavailableDatesCount === 0;
  }

  async getAvailableRooms(propertyId: string, checkIn: Date, checkOut: Date) {
    const rooms = await prisma.room.findMany({ where: { propertyId } });
    const availableRooms: string[] = [];

    for (const room of rooms) {
      const isAvailable = await this.checkRoomAvailability(
        room.id,
        checkIn,
        checkOut,
        prisma
      );
      if (isAvailable) availableRooms.push(room.id);
    }

    return availableRooms;
  }

  async upsertMany(
    data: { roomId: string; date: Date; price: number; isAvailable: boolean }[]
  ) {
    return prisma.$transaction(
      data.map((item) =>
        prisma.roomAvailability.upsert({
          where: {
            roomId_date: {
              roomId: item.roomId,
              date: item.date,
            },
          },
          update: {
            price: item.price,
            isAvailable: item.isAvailable,
          },
          create: {
            roomId: item.roomId,
            date: item.date,
            price: item.price,
            isAvailable: item.isAvailable,
          },
        })
      )
    );
  }
}

export default new RoomAvailabilityRepository();
