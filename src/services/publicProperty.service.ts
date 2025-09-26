import { prisma } from '../config/prisma';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import RoomReservationRepository from '../repositories/RoomReservation.repositori';
import { Prisma, Property, Room, RoomAvailability, PeakSeason } from '../../prisma/generated/client';
import { PropertyRepository } from '../repositories/property.repository';

const roomReservationRepo = new RoomReservationRepository();

const _buildPropertyWhereClause = (filters: any): Prisma.PropertyWhereInput => {
    const where: Prisma.PropertyWhereInput = {
        deletedAt: null,
        rooms: {
            some: {
                deletedAt: null
            }
        }
    };

    const searchTerm = filters.q || filters.search;
    if (searchTerm) {
        where.OR = [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { city: { name: { contains: searchTerm, mode: 'insensitive' } } },
            { category: { name: { contains: searchTerm, mode: 'insensitive' } } }
        ];
    }

    if (filters.category) {
        where.category = { name: { equals: filters.category as string, mode: 'insensitive' }, deletedAt: null };
    }
    if (filters.location) {
        where.city = { name: { contains: filters.location, mode: 'insensitive' }, deletedAt: null };
    }
    if (filters.startDate && filters.endDate) {
        (where.rooms!.some as Prisma.RoomWhereInput).availabilities = {
            none: { date: { gte: new Date(filters.startDate), lte: new Date(filters.endDate) }, isAvailable: false },
        };
    }

    if (filters.minPrice || filters.maxPrice) {
        const priceFilter: Prisma.FloatFilter = {};
        if (filters.minPrice) {
            priceFilter.gte = parseFloat(filters.minPrice as string);
        }
        if (filters.maxPrice) {
            priceFilter.lte = parseFloat(filters.maxPrice as string);
        }
        (where.rooms!.some as Prisma.RoomWhereInput).basePrice = priceFilter;
    }

    return where;
};

const _sortProperties = (properties: any[], sortBy: string, order: string) => {
    if (sortBy === 'price') {
        properties.sort((a, b) => {
            const minPriceA = a.rooms.length > 0 ? Math.min(...a.rooms.map((r: Room) => r.basePrice)) : Infinity;
            const minPriceB = b.rooms.length > 0 ? Math.min(...b.rooms.map((r: Room) => r.basePrice)) : Infinity;
            return order === 'asc' ? minPriceA - minPriceB : minPriceB - minPriceA;
        });
    } else {
        properties.sort((a, b) => order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
    }
};

const _paginateProperties = (properties: any[], page: number, limit: number, skip: number) => {
    const totalProperties = properties.length;
    const paginatedProperties = properties.slice(skip, skip + Number(limit));
    return {
        data: paginatedProperties.map(p => ({ ...p, rooms: p.rooms.slice(0, 1) })),
        meta: { total: totalProperties, page: Number(page), limit: Number(limit), totalPages: Math.ceil(totalProperties / Number(limit)) },
    };
};

const _buildAvailabilityMap = (availabilities: RoomAvailability[]) => {
    const availabilityMap = new Map();
    for (const ra of availabilities) {
        const dateStr = ra.date.toISOString().split('T')[0];
        if (!availabilityMap.has(dateStr)) {
            availabilityMap.set(dateStr, { lowestPrice: Infinity, isAvailable: false });
        }
        const current = availabilityMap.get(dateStr);
        if (ra.isAvailable) {
            current.isAvailable = true;
            if (ra.price < current.lowestPrice) current.lowestPrice = ra.price;
        }
    }
    return availabilityMap;
};

const _applyPeakSeason = (basePrice: number, date: Date, peakSeasons: PeakSeason[]): number => {
    let finalPrice = basePrice;
    const applicableSeason = peakSeasons.find(s =>
        isWithinInterval(date, { start: new Date(s.startDate), end: new Date(s.endDate) })
    );

    if (applicableSeason) {
        if (applicableSeason.adjustmentType === 'NOMINAL') {
            finalPrice += applicableSeason.adjustmentValue;
        } else {
            finalPrice *= (1 + applicableSeason.adjustmentValue / 100);
        }
    }
    return finalPrice;
};

const _generateDateRangeResult = (
    startDate: Date,
    endDate: Date,
    map: Map<any, any>,
    defaultPrice: number,
    peakSeasons: PeakSeason[]
) => {
    const result = [];
    for (let day = new Date(startDate); day <= endDate; day.setDate(day.getDate() + 1)) {
        const dateStr = day.toISOString().split('T')[0];
        const availability = map.get(dateStr);

        const priceWithSeason = _applyPeakSeason(defaultPrice, day, peakSeasons);

        result.push({
            date: dateStr,
            isAvailable: availability ? availability.isAvailable : true,
            price: availability && availability.lowestPrice !== Infinity ? availability.lowestPrice : priceWithSeason
        });
    }
    return result;
};

export const PublicPropertyService = {
    getProperties: async (filters: any) => {
        const { page = 1, limit = 10, sortBy = 'name', order = 'asc' } = filters;
        const skip = (Number(page) - 1) * Number(limit);
        const where = _buildPropertyWhereClause(filters);

        const properties = await prisma.property.findMany({
            where,
            include: {
                category: true, city: true,
                rooms: { where: { deletedAt: null }, orderBy: { basePrice: 'asc' } },
            },
        });

        _sortProperties(properties, sortBy, order);
        return _paginateProperties(properties, page, limit, skip);
    },

    getPropertyById: async (id: string) => {
        const property = await PropertyRepository.findPublicById(id);
        if (!property) {
            return null;
        }
        return property;
    },

    getAvailableRooms: async (propertyId: string, checkIn: Date, checkOut: Date) => {
        const availableRoomIds = await roomReservationRepo.getAvailableRooms(propertyId, checkIn, checkOut);
        if (availableRoomIds.length === 0) return [];

        return await prisma.room.findMany({
            where: { id: { in: availableRoomIds }, deletedAt: null }
        });
    },

    getMonthlyAvailability: async (propertyId: string, month: number, year: number) => {
        const startDate = startOfMonth(new Date(year, month - 1));
        const endDate = endOfMonth(new Date(year, month - 1));

        const rooms = await prisma.room.findMany({
            where: { propertyId, deletedAt: null },
            select: { id: true, basePrice: true },
        });
        if (rooms.length === 0) return [];

        const roomIds = rooms.map(r => r.id);
        const peakSeasons = await prisma.peakSeason.findMany({
            where: { roomId: { in: roomIds } }
        });

        const roomAvailabilities = await prisma.roomAvailability.findMany({
            where: { roomId: { in: roomIds }, date: { gte: startDate, lte: endDate } },
        });

        const availabilityMap = _buildAvailabilityMap(roomAvailabilities);
        const defaultLowestPrice = Math.min(...rooms.map(r => r.basePrice));

        return _generateDateRangeResult(startDate, endDate, availabilityMap, defaultLowestPrice, peakSeasons);
    },

    getCities: async () => {
        return await prisma.city.findMany({
            where: { deletedAt: null },
            orderBy: { name: 'asc' }
        });
    },

    findNearby: async (lat: number, lon: number, radius: number = 10000) => {
        const properties = await prisma.$queryRaw<Property[]>`
      SELECT
        p.id,
        p.name,
        p."mainImage",
        json_build_object('id', c.id::text, 'name', c.name::text) as category,
        json_build_object('id', ct.id::text, 'name', ct.name::text) as city,
        (
          SELECT COALESCE(
            json_agg(
              json_build_object('id', r.id::text, 'name', r.name::text, 'basePrice', r."basePrice")
            ),
            '[]'::json
          )
          FROM (
            SELECT *
            FROM "Room" as r_inner
            WHERE r_inner."propertyId" = p.id AND r_inner."deletedAt" IS NULL
            ORDER BY r_inner."basePrice" ASC
            LIMIT 1
          ) as r
        ) as rooms
      FROM
        "Property" as p
      LEFT JOIN
        "Category" as c ON p."categoryId" = c.id
      LEFT JOIN
        "City" as ct ON p."cityId" = ct.id
      WHERE
        ST_DWithin(
          ST_MakePoint(p.longitude::double precision, p.latitude::double precision)::geography,
          ST_MakePoint(${lon}, ${lat})::geography,
          ${radius}
        )
        AND p."deletedAt" IS NULL
      LIMIT 15;
    `;
        return properties;
    },
};