import { prisma } from '../config/prisma';
import { startOfMonth, endOfMonth } from 'date-fns';
import RoomReservationRepository from '../repositories/RoomReservation.repositori';
import { Prisma } from '../generated/prisma';

const roomReservationRepo = new RoomReservationRepository();

export const PublicPropertyService = {
  getProperties: async (filters: any) => {
    const { page = 1, limit = 10, sortBy = 'name', order = 'asc', search, category, location, startDate, endDate } = filters;
    const skip = (Number(page) - 1) * Number(limit);

    const where: Prisma.PropertyWhereInput = {
      deletedAt: null,
      rooms: {
        some: {
          deletedAt: null
        }
      }
    };

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    if (category) {
      where.category = {
        name: {
          equals: category as string,
          mode: 'insensitive',
        },
        deletedAt: null
      };
    }
    if (location) {
      where.city = {
        name: {
          contains: location,
          mode: 'insensitive',
        },
        deletedAt: null,
      };
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (where.rooms && where.rooms.some) {
        (where.rooms.some as Prisma.RoomWhereInput).availabilities = {
          none: {
            date: { gte: start, lte: end },
            isAvailable: false,
          },
        };
      }
    }

    const properties = await prisma.property.findMany({
      where,
      include: {
        category: true,
        city: true,
        rooms: {
          where: { deletedAt: null },
          orderBy: { basePrice: 'asc' },
        },
      },
    });

    if (sortBy === 'price') {
      properties.sort((a, b) => {
        const minPriceA = a.rooms.length > 0 ? Math.min(...a.rooms.map(r => r.basePrice)) : Infinity;
        const minPriceB = b.rooms.length > 0 ? Math.min(...b.rooms.map(r => r.basePrice)) : Infinity;
        return order === 'asc' ? minPriceA - minPriceB : minPriceB - minPriceA;
      });
    } else {
      properties.sort((a, b) => {
        return order === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      });
    }

    const totalProperties = properties.length;
    const paginatedProperties = properties.slice(skip, skip + Number(limit));

    return {
      data: paginatedProperties.map(p => ({
        ...p,
        rooms: p.rooms.slice(0, 1)
      })),
      meta: { total: totalProperties, page: Number(page), limit: Number(limit), totalPages: Math.ceil(totalProperties / Number(limit)) },
    };
  },

  getPropertyById: async (id: string) => {
    const property = await prisma.property.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: true,
        city: true,
        tenant: {
          include: {
            user: {
              select: { fullName: true, profilePicture: true }
            }
          }
        },
        rooms: { where: { deletedAt: null } },
        amenities: { where: { deletedAt: null } },
        reviews: {
          where: { deletedAt: null },
          include: {
            user: {
              select: { fullName: true, profilePicture: true }
            }
          }
        },
        images: true,
      },
    });

    if (property && (property.category?.deletedAt || property.city?.deletedAt || property.tenant?.deletedAt)) {
      return null;
    }

    return property;
  },

  getAvailableRooms: async (propertyId: string, checkIn: Date, checkOut: Date) => {
    const availableRoomIds = await roomReservationRepo.getAvailableRooms(propertyId, checkIn, checkOut);

    if (availableRoomIds.length === 0) {
      return [];
    }

    const rooms = await prisma.room.findMany({
      where: {
        id: { in: availableRoomIds },
        deletedAt: null
      }
    });

    return rooms;
  },

  getMonthlyAvailability: async (propertyId: string, month: number, year: number) => {
    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(new Date(year, month - 1));

    const rooms = await prisma.room.findMany({
      where: { propertyId: propertyId, deletedAt: null },
      select: { id: true, basePrice: true },
    });
    if (rooms.length === 0) return [];

    const roomIds = rooms.map(room => room.id);
    const roomAvailabilities = await prisma.roomAvailability.findMany({
      where: { roomId: { in: roomIds }, date: { gte: startDate, lte: endDate } },
    });

    const availabilityMap = new Map();
    for (const ra of roomAvailabilities) {
      const dateStr = ra.date.toISOString().split('T')[0];
      if (!availabilityMap.has(dateStr)) {
        availabilityMap.set(dateStr, { lowestPrice: Infinity, isAvailable: false });
      }
      const current = availabilityMap.get(dateStr);
      if (ra.isAvailable) {
        current.isAvailable = true;
        if (ra.price < current.lowestPrice) {
          current.lowestPrice = ra.price;
        }
      }
    }

    const defaultLowestPrice = Math.min(...rooms.map(r => r.basePrice));
    const result = [];
    for (let day = new Date(startDate); day <= endDate; day.setDate(day.getDate() + 1)) {
      const dateStr = day.toISOString().split('T')[0];
      const availability = availabilityMap.get(dateStr);
      result.push({
        date: dateStr,
        isAvailable: availability ? availability.isAvailable : true,
        price: availability && availability.lowestPrice !== Infinity ? availability.lowestPrice : defaultLowestPrice
      });
    }
    return result;
  },

  getCities: async () => {
    return await prisma.city.findMany({
      where: { deletedAt: null },
      orderBy: {
        name: 'asc'
      }
    });
  },
};