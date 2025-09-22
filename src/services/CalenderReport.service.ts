import { eachDayOfInterval, isWithinInterval } from "date-fns";
import { prisma } from "../config/prisma";
import CalenderReportRepositori from "../repositories/CalenderReport.repositori";
import ApiError from "../utils/apiError";
import { BookingStatus } from "../generated/prisma";

const calenderRepo = new CalenderReportRepositori();

export const getCalenderReport = async (
    tenantId: string,
    propertyId?: string,
    roomId?: string,
    startDate?: Date,
    endDate?: Date
) => {
    if (!startDate || !endDate || !roomId) {
        throw new ApiError(400, "StartDate, EndDate, and RoomID are required.");
    }
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new ApiError(400, "Invalid date time");
    }
    if (startDate > endDate) {
        throw new ApiError(400, "Start date cannot be after end date.");
    }

    const roomData = await prisma.room.findFirst({
        where: {
            id: roomId,
            property: {
                id: propertyId,
                tenantId: tenantId
            }
        },
        select: {
            name: true,
            basePrice: true,
            property: { select: { id: true, name: true } }
        }
    });

    if (!roomData) {
        throw new ApiError(404, `Room with id ${roomId} not found in property ${propertyId} for this tenant.`);
    }

    const rawAvailabilityData = await calenderRepo.getRoomAvailibity(
        tenantId,
        propertyId,
        roomId,
        startDate,
        endDate
    );

    const bookings = await prisma.booking.findMany({
        where: {
            bookingRooms: { some: { roomId: roomId } },
            status: { not: BookingStatus.DIBATALKAN },
            checkIn: { lte: endDate },
            checkOut: { gte: startDate },
        },
        select: { checkIn: true, checkOut: true, status: true },
    });

    const calenderDate: { [key: string]: any } = {};
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

    for (const day of dateRange) {
        const dateString = day.toISOString().split('T')[0];
        let dayStatus: 'AVAILABLE' | 'BOOKED' | 'PENDING' | 'UNAVAILABLE' = 'AVAILABLE';
        let dayPrice = roomData.basePrice;

        const activeBooking = bookings.find(b => day >= b.checkIn && day < b.checkOut);
        if (activeBooking) {
            dayStatus = activeBooking.status === BookingStatus.MENUNGGU_PEMBAYARAN ? 'PENDING' : 'BOOKED';
        } else {
            const availabilityRecord = rawAvailabilityData.find(r => r.date.toISOString().split('T')[0] === dateString);
            if (availabilityRecord) {
                if (!availabilityRecord.isAvailable) {
                    dayStatus = 'UNAVAILABLE';
                }
                if (availabilityRecord.price > 0) {
                    dayPrice = availabilityRecord.price;
                }
            }
        }

        calenderDate[dateString] = {
            propertyId: roomData.property.id,
            propertyName: roomData.property.name,
            roomId: roomId,
            roomName: roomData.name,
            status: dayStatus,
            price: dayPrice,
        };
    }

    return calenderDate;
}

export const getAggregatedPropertyReport = async (
    tenantId: string,
    propertyId: string,
    startDate: Date,
    endDate: Date
) => {
    const rawAvailabilityData = await calenderRepo.getRoomAvailibity(
        tenantId, propertyId, undefined, startDate, endDate
    );

    const totalRoomsInProperty = await prisma.room.count({
        where: { propertyId: propertyId, deletedAt: null }
    });

    if (totalRoomsInProperty === 0) return {};

    const groupedByDate = new Map<string, any[]>();
    for (const record of rawAvailabilityData) {
        const dateString = record.date.toISOString().split('T')[0];
        if (!groupedByDate.has(dateString)) {
            groupedByDate.set(dateString, []);
        }
        groupedByDate.get(dateString)!.push(record);
    }

    const availabilityByDate: {
        [key: string]: {
            status: 'FULLY_AVAILABLE' | 'PARTIALLY_AVAILABLE' | 'FULLY_BOOKED';
            availableCount: number;
            totalRooms: number;
        }
    } = {};

    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

    for (const day of dateRange) {
        const dateString = day.toISOString().split('T')[0];
        const recordsForDate = groupedByDate.get(dateString) || [];

        const availableRecordsCount = recordsForDate.filter(r => r.isAvailable).length;
        const totalRecordsCount = recordsForDate.length;

        const unrecordedAvailableCount = totalRoomsInProperty - totalRecordsCount;
        const totalAvailableCount = availableRecordsCount + unrecordedAvailableCount;

        let status: 'FULLY_AVAILABLE' | 'PARTIALLY_AVAILABLE' | 'FULLY_BOOKED';

        if (totalAvailableCount === 0) {
            status = 'FULLY_BOOKED';
        } else if (totalAvailableCount >= totalRoomsInProperty) {
            status = 'FULLY_AVAILABLE';
        } else {
            status = 'PARTIALLY_AVAILABLE';
        }

        availabilityByDate[dateString] = {
            status,
            availableCount: totalAvailableCount,
            totalRooms: totalRoomsInProperty
        };
    }

    return availabilityByDate;
};