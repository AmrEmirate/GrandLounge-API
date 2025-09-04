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
