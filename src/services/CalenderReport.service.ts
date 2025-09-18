import { eachDayOfInterval } from "date-fns";
import { prisma } from "../config/prisma";
import CalenderReportRepositori from "../repositories/CalenderReport.repositori";
import ApiError from "../utils/apiError";

const calenderRepo = new CalenderReportRepositori();

export const getCalenderReport = async (
    tenantId: string,
    propertyId?: string,
    roomId?: string,
    startDate?: Date,
    endDate?: Date) => {
    if (!startDate || !endDate) {
        throw new ApiError(400, "StartDate and EndDate are required.");
    }

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new ApiError(400, "Invalid date time");
    }

    if (startDate > endDate) {
        throw new ApiError(400, "Start date cannot be after end date.");
    }

    const rawAvailabilityData = await calenderRepo.getRoomAvailibity(
        tenantId,
        propertyId,
        roomId,
        startDate,
        endDate
    );

    const calenderDate: { [key: string]: any[] } = {};

    for (const record of rawAvailabilityData) {
        const dateString = record.date.toISOString().split('T')[0];
        if (!calenderDate[dateString]) {
            calenderDate[dateString] = [];
        }
        calenderDate[dateString].push({
            propertyId: record.room.property.id,
            propertyName: record.room.property.name,
            roomId: record.roomId,
            roomName: record.room.name,
            isAvailable: record.isAvailable,
            price: record.price,
        });
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

    // Kelompokkan data yang ada untuk akses cepat
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