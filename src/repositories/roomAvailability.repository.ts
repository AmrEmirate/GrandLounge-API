import { prisma } from "../config/prisma";
import { RoomAvailability, Prisma } from "@prisma/client";
import { startOfMonth, endOfMonth } from "date-fns";

class RoomAvailabilityRepository {
  async findForMonth(
    roomId: string,
    month: number,
    year: number
  ): Promise<RoomAvailability[]> {
    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(new Date(year, month - 1));

    return prisma.roomAvailability.findMany({
      where: {
        roomId: roomId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
  }

  async upsertMany(
    data: Prisma.RoomAvailabilityCreateManyInput[]
  ): Promise<void> {
    const operations = data.map((item) =>
      prisma.roomAvailability.upsert({
        where: {
          roomId_date: {
            roomId: item.roomId,
            date: new Date(item.date),
          },
        },
        update: {
          price: item.price,
          isAvailable: item.isAvailable,
        },
        create: {
          roomId: item.roomId,
          date: new Date(item.date),
          price: item.price,
          isAvailable: item.isAvailable,
        },
      })
    );
    await prisma.$transaction(operations);
  }

  async findManyByRoomIdAndDateRange(
    roomId: string,
    startDate: Date,
    endDate: Date
  ): Promise<RoomAvailability[]> {
    return prisma.roomAvailability.findMany({
      where: {
        roomId: roomId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: "asc",
      },
    });
  }
}

export default new RoomAvailabilityRepository();
