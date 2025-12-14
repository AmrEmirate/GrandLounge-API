import { prisma } from "../config/prisma";
import { Prisma, BookingStatus } from "@prisma/client";

class OrderListRepositroy {
  async updateBookingStatus(bookingId: string, newStatus: string) {
    return prisma.booking.update({
      where: { id: bookingId },
      data: { status: newStatus as BookingStatus },
    });
  }

  async findReservationByFilter(
    user: string,
    filter: {
      checkIn?: Date;
      searchQuery?: string;
      status?: string;
      propertyName?: string;
    }
  ) {
    const where: Prisma.BookingWhereInput = {
      userId: user,
    };

    const andConditions: Prisma.BookingWhereInput[] = [];

    if (filter.status) {
      where.status = filter.status as BookingStatus;
    }

    if (filter.propertyName) {
      andConditions.push({
        property: {
          name: {
            contains: filter.propertyName,
            mode: "insensitive",
          },
        },
      });
    }

    if (filter.checkIn) {
      const targetDate = new Date(filter.checkIn);
      const startDate = new Date(
        Date.UTC(
          targetDate.getUTCFullYear(),
          targetDate.getUTCMonth(),
          targetDate.getUTCDate(),
          0,
          0,
          0,
          0
        )
      );
      const endDate = new Date(startDate);
      endDate.setUTCDate(startDate.getUTCDate() + 1);

      andConditions.push({
        checkIn: {
          gte: startDate,
          lt: endDate,
        },
      });
    }

    if (filter.searchQuery) {
      andConditions.push({
        OR: [
          {
            invoiceNumber: {
              contains: filter.searchQuery,
              mode: "insensitive",
            },
          },
          {
            reservationId: {
              contains: filter.searchQuery,
              mode: "insensitive",
            },
          },
        ],
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    return prisma.booking.findMany({
      where,
      include: {
        bookingRooms: true,
        property: true,
        review: {
          include: {
            user: true,
            property: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}

export default new OrderListRepositroy();
