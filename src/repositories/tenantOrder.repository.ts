import { prisma } from "../config/prisma";
import { Prisma, BookingStatus } from "@prisma/client";

class TenantOrderRepository {
  async findTransactionsByFilterForTenant(
    tenantId: string,
    filter: {
      checkIn?: Date;
      searchQuery?: string;
      status?: BookingStatus;
      propertyId?: string;
    }
  ) {
    const where: Prisma.BookingWhereInput = {
      user: {
        id: { not: undefined },
      },
      property: {
        tenantId: tenantId,
        id: { not: undefined },
      },
    };

    const andConditions: Prisma.BookingWhereInput[] = [];

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.propertyId) {
      andConditions.push({
        propertyId: filter.propertyId,
      });
    }

    if (filter.searchQuery) {
      andConditions.push({
        OR: [
          {
            user: {
              fullName: { contains: filter.searchQuery, mode: "insensitive" },
            },
          },
          {
            property: {
              name: { contains: filter.searchQuery, mode: "insensitive" },
            },
          },
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

      const endDate = new Date(
        Date.UTC(
          targetDate.getUTCFullYear(),
          targetDate.getUTCMonth(),
          targetDate.getUTCDate(),
          23,
          59,
          59,
          999
        )
      );

      andConditions.push({
        checkIn: {
          gte: startDate,
          lte: endDate,
        },
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    return prisma.booking.findMany({
      where,
      include: {
        user: { select: { fullName: true } },
        property: { select: { name: true, mainImage: true } },
        review: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findPendingConfirmationForTenant(tenantId: string, limit: number = 5) {
    return prisma.booking.findMany({
      where: {
        status: BookingStatus.MENUNGGU_KONFIRMASI,
        property: {
          tenantId: tenantId,
        },
        paymentProof: {
          not: null,
        },
      },
      include: {
        user: { select: { fullName: true, profilePicture: true } },
        property: { select: { name: true } },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: limit,
    });
  }
}

export default new TenantOrderRepository();
