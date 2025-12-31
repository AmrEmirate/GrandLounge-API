import { prisma } from "../config/prisma";
import { startOfMonth, endOfMonth, addDays } from "date-fns";
import RoomAvailabilityRepository from "../repositories/roomAvailability.repository";
import { Property } from "@prisma/client";
import PropertyRepository from "../repositories/property.repository";
import { PropertyQueryUtils } from "../utils/propertyQuery.utils";

class PublicPropertyService {
  public async getProperties(filters: any) {
    const { page = 1, limit = 10, sortBy = "name", order = "asc" } = filters;
    const skip = (Number(page) - 1) * Number(limit);
    const where = PropertyQueryUtils.buildPropertyWhereClause(filters);

    const properties = await prisma.property.findMany({
      where,
      include: {
        category: true,
        city: true,
        rooms: { where: { deletedAt: null }, orderBy: { basePrice: "asc" } },
      },
    });

    PropertyQueryUtils.sortProperties(properties, sortBy, order);
    return PropertyQueryUtils.paginateProperties(
      properties,
      Number(page),
      Number(limit),
      skip
    );
  }

  public async getPropertyById(id: string) {
    const property = await PropertyRepository.findPublicById(id);
    if (!property) {
      return null;
    }
    return property;
  }

  public async getAvailableRooms(
    propertyId: string,
    checkIn: Date,
    checkOut: Date
  ) {
    const availableRoomIds = await RoomAvailabilityRepository.getAvailableRooms(
      propertyId,
      checkIn,
      checkOut
    );
    if (availableRoomIds.length === 0) return [];

    const availableRooms = await prisma.room.findMany({
      where: { id: { in: availableRoomIds }, deletedAt: null },
      include: { peakSeasons: true },
    });

    const roomAvailabilities = await prisma.roomAvailability.findMany({
      where: {
        roomId: { in: availableRoomIds },
        date: { gte: checkIn, lte: checkOut },
      },
    });

    const roomsWithPrices = availableRooms.map((room) => {
      const { totalPrice, dailyPrices } =
        PropertyQueryUtils.calculateBookingPrice(
          room,
          checkIn,
          checkOut,
          roomAvailabilities
        );
      return {
        ...room,
        totalPrice,
        dailyPrices,
      };
    });

    return roomsWithPrices;
  }

  public async getMonthlyAvailability(
    propertyId: string,
    month: number,
    year: number
  ) {
    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(new Date(year, month - 1));

    const rooms = await prisma.room.findMany({
      where: { propertyId, deletedAt: null },
      include: { peakSeasons: true },
    });
    if (rooms.length === 0) return [];

    const roomIds = rooms.map((r) => r.id);
    const roomAvailabilities = await prisma.roomAvailability.findMany({
      where: {
        roomId: { in: roomIds },
        date: { gte: startDate, lte: endDate },
      },
    });

    const availabilityMap = new Map<
      string,
      { [roomId: string]: { isAvailable: boolean; price: number } }
    >();

    for (const ra of roomAvailabilities) {
      const dateStr = ra.date.toISOString().split("T")[0];
      if (!availabilityMap.has(dateStr)) {
        availabilityMap.set(dateStr, {});
      }
      availabilityMap.get(dateStr)![ra.roomId] = {
        isAvailable: ra.isAvailable,
        price: ra.price,
      };
    }

    const result = [];
    let day = new Date(startDate);
    while (day <= endDate) {
      const dateStr = day.toISOString().split("T")[0];
      let lowestPriceForDay = Infinity;
      let isAvailableForDay = false;

      for (const room of rooms) {
        let currentPrice = room.basePrice;
        let currentAvailability = true;

        if (
          availabilityMap.has(dateStr) &&
          availabilityMap.get(dateStr)![room.id]
        ) {
          const manualAvailability = availabilityMap.get(dateStr)![room.id];
          currentAvailability = manualAvailability.isAvailable;
          currentPrice = manualAvailability.price;
        }

        if (currentAvailability) {
          const finalPrice = PropertyQueryUtils.applyPeakSeason(
            currentPrice,
            day,
            room.peakSeasons
          );
          if (finalPrice < lowestPriceForDay) {
            lowestPriceForDay = finalPrice;
          }
          isAvailableForDay = true;
        }
      }

      result.push({
        date: dateStr,
        isAvailable: isAvailableForDay,
        price: lowestPriceForDay === Infinity ? null : lowestPriceForDay,
      });

      day = addDays(day, 1);
    }

    return result;
  }

  public async getCities() {
    return await prisma.city.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
    });
  }

  public async findNearby(lat: number, lon: number, radius: number = 10000) {
    // Convert radius from meters to kilometers for Haversine formula
    const radiusKm = radius / 1000;

    const properties = await prisma.$queryRaw<Property[]>`
        SELECT
          p.id, p.name, p."mainImage", p.latitude, p.longitude,
          json_build_object('id', c.id::text, 'name', c.name::text) as category,
          json_build_object('id', ct.id::text, 'name', ct.name::text) as city,
          (
            SELECT COALESCE(json_agg(json_build_object('id', r.id::text, 'name', r.name::text, 'basePrice', r."basePrice")), '[]'::json)
            FROM (
              SELECT *
              FROM "Room" as r_inner
              WHERE r_inner."propertyId" = p.id AND r_inner."deletedAt" IS NULL
              ORDER BY r_inner."basePrice" ASC
              LIMIT 1
            ) as r
          ) as rooms,
          (
            6371 * acos(
              cos(radians(${lat})) * cos(radians(p.latitude)) *
              cos(radians(p.longitude) - radians(${lon})) +
              sin(radians(${lat})) * sin(radians(p.latitude))
            )
          ) as distance
        FROM "Property" as p
        LEFT JOIN "Category" as c ON p."categoryId" = c.id
        LEFT JOIN "City" as ct ON p."cityId" = ct.id
        WHERE p."deletedAt" IS NULL
          AND p.latitude IS NOT NULL
          AND p.longitude IS NOT NULL
          AND (
            6371 * acos(
              cos(radians(${lat})) * cos(radians(p.latitude)) *
              cos(radians(p.longitude) - radians(${lon})) +
              sin(radians(${lat})) * sin(radians(p.latitude))
            )
          ) <= ${radiusKm}
        ORDER BY distance ASC
        LIMIT 15;
      `;
    return properties;
  }

  public async getPublicStats() {
    // Count total properties
    const totalProperties = await prisma.property.count({
      where: { deletedAt: null },
    });

    // Count total completed bookings (as proxy for guests)
    const totalBookings = await prisma.booking.count({
      where: { status: "SELESAI" },
    });

    // Calculate average rating from reviews
    const avgRating = await prisma.review.aggregate({
      _avg: { rating: true },
    });

    // Count total rooms
    const totalRooms = await prisma.room.count({
      where: { deletedAt: null },
    });

    return {
      totalProperties,
      totalGuests: totalBookings, // Each booking = 1 guest party
      averageRating: avgRating._avg.rating
        ? Number(avgRating._avg.rating.toFixed(1))
        : 4.5,
      totalRooms,
    };
  }

  public async getPopularDestinations() {
    // Get destinations with most bookings and highest ratings
    const popularDestinations = await prisma.$queryRaw<
      Array<{
        cityId: string;
        cityName: string;
        categoryName: string;
        bookingCount: bigint;
        avgRating: number | null;
      }>
    >`
      SELECT 
        c.id as "cityId",
        c.name as "cityName",
        cat.name as "categoryName",
        COUNT(b.id) as "bookingCount",
        AVG(r.rating) as "avgRating"
      FROM "Property" p
      INNER JOIN "City" c ON p."cityId" = c.id
      INNER JOIN "Category" cat ON p."categoryId" = cat.id
      LEFT JOIN "Booking" b ON b."propertyId" = p.id AND b.status = 'SELESAI'
      LEFT JOIN "Review" r ON r."propertyId" = p.id
      WHERE p."deletedAt" IS NULL
      GROUP BY c.id, c.name, cat.name
      ORDER BY COUNT(b.id) DESC, AVG(r.rating) DESC NULLS LAST
      LIMIT 6
    `;

    return popularDestinations.map((dest) => ({
      cityId: dest.cityId,
      cityName: dest.cityName,
      categoryName: dest.categoryName,
      bookingCount: Number(dest.bookingCount),
      avgRating: dest.avgRating ? Number(dest.avgRating.toFixed(1)) : null,
    }));
  }
}

export default new PublicPropertyService();
