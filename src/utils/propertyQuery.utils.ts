import { Prisma, Room, PeakSeason, RoomAvailability } from "@prisma/client";
import { isWithinInterval, addDays } from "date-fns";

export class PropertyQueryUtils {
  static buildPropertyWhereClause(filters: any): Prisma.PropertyWhereInput {
    const where: Prisma.PropertyWhereInput = {
      deletedAt: null,
      rooms: {
        some: {
          deletedAt: null,
        },
      },
    };

    const searchTerm = filters.q || filters.search;
    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { city: { name: { contains: searchTerm, mode: "insensitive" } } },
        { category: { name: { contains: searchTerm, mode: "insensitive" } } },
      ];
    }

    if (filters.category) {
      where.category = {
        name: { equals: filters.category as string, mode: "insensitive" },
        deletedAt: null,
      };
    }
    if (filters.location) {
      where.city = {
        name: { contains: filters.location, mode: "insensitive" },
        deletedAt: null,
      };
    }
    if (filters.startDate && filters.endDate) {
      (where.rooms!.some as Prisma.RoomWhereInput).availabilities = {
        none: {
          date: {
            gte: new Date(filters.startDate),
            lte: new Date(filters.endDate),
          },
          isAvailable: false,
        },
      };
    }

    if (filters.minPrice || filters.maxPrice) {
      const priceFilter: Prisma.FloatFilter = {};
      if (filters.minPrice)
        priceFilter.gte = parseFloat(filters.minPrice as string);
      if (filters.maxPrice)
        priceFilter.lte = parseFloat(filters.maxPrice as string);
      (where.rooms!.some as Prisma.RoomWhereInput).basePrice = priceFilter;
    }

    return where;
  }

  static sortProperties(
    properties: any[],
    sortBy: string,
    order: string
  ): void {
    if (sortBy === "price") {
      properties.sort((a, b) => {
        const minPriceA =
          a.rooms.length > 0
            ? Math.min(...a.rooms.map((r: Room) => r.basePrice))
            : Infinity;
        const minPriceB =
          b.rooms.length > 0
            ? Math.min(...b.rooms.map((r: Room) => r.basePrice))
            : Infinity;
        return order === "asc" ? minPriceA - minPriceB : minPriceB - minPriceA;
      });
    } else {
      properties.sort((a, b) =>
        order === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      );
    }
  }

  static paginateProperties(
    properties: any[],
    page: number,
    limit: number,
    skip: number
  ) {
    const totalProperties = properties.length;
    const paginatedProperties = properties.slice(skip, skip + Number(limit));
    return {
      data: paginatedProperties.map((p) => ({
        ...p,
        rooms: p.rooms.slice(0, 1),
      })),
      meta: {
        total: totalProperties,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalProperties / Number(limit)),
      },
    };
  }

  static applyPeakSeason(
    basePrice: number,
    date: Date,
    peakSeasons: PeakSeason[]
  ): number {
    let finalPrice = basePrice;
    const applicableSeason = peakSeasons.find((s) =>
      isWithinInterval(date, {
        start: new Date(s.startDate),
        end: new Date(s.endDate),
      })
    );

    if (applicableSeason) {
      if (applicableSeason.adjustmentType === "NOMINAL") {
        finalPrice += applicableSeason.adjustmentValue;
      } else {
        finalPrice *= 1 + applicableSeason.adjustmentValue / 100;
      }
    }
    return finalPrice;
  }

  static calculateBookingPrice(
    room: any,
    checkIn: Date,
    checkOut: Date,
    roomAvailabilities: RoomAvailability[]
  ) {
    let totalPrice = 0;
    const dailyPrices = [];
    let day = new Date(checkIn);

    while (day < checkOut) {
      const dateStr = day.toISOString().split("T")[0];
      const manualAvailability = roomAvailabilities.find(
        (ra) =>
          ra.roomId === room.id &&
          ra.date.toISOString().split("T")[0] === dateStr
      );

      const basePrice = manualAvailability
        ? manualAvailability.price
        : room.basePrice;
      const finalPrice = this.applyPeakSeason(basePrice, day, room.peakSeasons);

      totalPrice += finalPrice;
      dailyPrices.push({ date: dateStr, price: finalPrice });

      day = addDays(day, 1);
    }
    return { totalPrice, dailyPrices };
  }
}
