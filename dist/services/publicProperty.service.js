"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicPropertyService = void 0;
const prisma_1 = require("../config/prisma");
const date_fns_1 = require("date-fns");
const RoomReservation_repositori_1 = __importDefault(require("../repositories/RoomReservation.repositori"));
const property_repository_1 = require("../repositories/property.repository");
const roomReservationRepo = new RoomReservation_repositori_1.default();
const _buildPropertyWhereClause = (filters) => {
    const where = {
        deletedAt: null,
        rooms: {
            some: {
                deletedAt: null
            }
        }
    };
    if (filters.search) {
        where.name = { contains: filters.search, mode: 'insensitive' };
    }
    if (filters.category) {
        where.category = { name: { equals: filters.category, mode: 'insensitive' }, deletedAt: null };
    }
    if (filters.location) {
        where.city = { name: { contains: filters.location, mode: 'insensitive' }, deletedAt: null };
    }
    if (filters.startDate && filters.endDate) {
        where.rooms.some.availabilities = {
            none: { date: { gte: new Date(filters.startDate), lte: new Date(filters.endDate) }, isAvailable: false },
        };
    }
    if (filters.minPrice || filters.maxPrice) {
        const priceFilter = {};
        if (filters.minPrice) {
            priceFilter.gte = parseFloat(filters.minPrice);
        }
        if (filters.maxPrice) {
            priceFilter.lte = parseFloat(filters.maxPrice);
        }
        where.rooms.some.basePrice = priceFilter;
    }
    return where;
};
const _sortProperties = (properties, sortBy, order) => {
    if (sortBy === 'price') {
        properties.sort((a, b) => {
            const minPriceA = a.rooms.length > 0 ? Math.min(...a.rooms.map((r) => r.basePrice)) : Infinity;
            const minPriceB = b.rooms.length > 0 ? Math.min(...b.rooms.map((r) => r.basePrice)) : Infinity;
            return order === 'asc' ? minPriceA - minPriceB : minPriceB - minPriceA;
        });
    }
    else {
        properties.sort((a, b) => order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
    }
};
const _paginateProperties = (properties, page, limit, skip) => {
    const totalProperties = properties.length;
    const paginatedProperties = properties.slice(skip, skip + Number(limit));
    return {
        data: paginatedProperties.map(p => (Object.assign(Object.assign({}, p), { rooms: p.rooms.slice(0, 1) }))),
        meta: { total: totalProperties, page: Number(page), limit: Number(limit), totalPages: Math.ceil(totalProperties / Number(limit)) },
    };
};
const _buildAvailabilityMap = (availabilities) => {
    const availabilityMap = new Map();
    for (const ra of availabilities) {
        const dateStr = ra.date.toISOString().split('T')[0];
        if (!availabilityMap.has(dateStr)) {
            availabilityMap.set(dateStr, { lowestPrice: Infinity, isAvailable: false });
        }
        const current = availabilityMap.get(dateStr);
        if (ra.isAvailable) {
            current.isAvailable = true;
            if (ra.price < current.lowestPrice)
                current.lowestPrice = ra.price;
        }
    }
    return availabilityMap;
};
const _generateDateRangeResult = (startDate, endDate, map, defaultPrice) => {
    const result = [];
    for (let day = new Date(startDate); day <= endDate; day.setDate(day.getDate() + 1)) {
        const dateStr = day.toISOString().split('T')[0];
        const availability = map.get(dateStr);
        result.push({
            date: dateStr,
            isAvailable: availability ? availability.isAvailable : true,
            price: availability && availability.lowestPrice !== Infinity ? availability.lowestPrice : defaultPrice
        });
    }
    return result;
};
exports.PublicPropertyService = {
    getProperties: (filters) => __awaiter(void 0, void 0, void 0, function* () {
        const { page = 1, limit = 10, sortBy = 'name', order = 'asc' } = filters;
        const skip = (Number(page) - 1) * Number(limit);
        const where = _buildPropertyWhereClause(filters);
        const properties = yield prisma_1.prisma.property.findMany({
            where,
            include: {
                category: true, city: true,
                rooms: { where: { deletedAt: null }, orderBy: { basePrice: 'asc' } },
            },
        });
        _sortProperties(properties, sortBy, order);
        return _paginateProperties(properties, page, limit, skip);
    }),
    getPropertyById: (id) => __awaiter(void 0, void 0, void 0, function* () {
        const property = yield property_repository_1.PropertyRepository.findPublicById(id);
        if (!property) {
            return null;
        }
        return property;
    }),
    getAvailableRooms: (propertyId, checkIn, checkOut) => __awaiter(void 0, void 0, void 0, function* () {
        const availableRoomIds = yield roomReservationRepo.getAvailableRooms(propertyId, checkIn, checkOut);
        if (availableRoomIds.length === 0)
            return [];
        return yield prisma_1.prisma.room.findMany({
            where: { id: { in: availableRoomIds }, deletedAt: null }
        });
    }),
    getMonthlyAvailability: (propertyId, month, year) => __awaiter(void 0, void 0, void 0, function* () {
        const startDate = (0, date_fns_1.startOfMonth)(new Date(year, month - 1));
        const endDate = (0, date_fns_1.endOfMonth)(new Date(year, month - 1));
        const rooms = yield prisma_1.prisma.room.findMany({
            where: { propertyId, deletedAt: null },
            select: { id: true, basePrice: true },
        });
        if (rooms.length === 0)
            return [];
        const roomAvailabilities = yield prisma_1.prisma.roomAvailability.findMany({
            where: { roomId: { in: rooms.map(r => r.id) }, date: { gte: startDate, lte: endDate } },
        });
        const availabilityMap = _buildAvailabilityMap(roomAvailabilities);
        const defaultLowestPrice = Math.min(...rooms.map(r => r.basePrice));
        return _generateDateRangeResult(startDate, endDate, availabilityMap, defaultLowestPrice);
    }),
    getCities: () => __awaiter(void 0, void 0, void 0, function* () {
        return yield prisma_1.prisma.city.findMany({
            where: { deletedAt: null },
            orderBy: { name: 'asc' }
        });
    }),
    findNearby: (lat_1, lon_1, ...args_1) => __awaiter(void 0, [lat_1, lon_1, ...args_1], void 0, function* (lat, lon, radius = 10000) {
        const properties = yield prisma_1.prisma.$queryRaw `
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
    }),
};
