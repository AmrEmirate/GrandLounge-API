import { Request, Response, NextFunction } from "express";
import { createReservationService } from "../services/RoomReservation.service";
import ApiError from "../utils/apiError";

export const createReservationController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { roomId, startDate, endDate, guestInfo } = req.body;

        if (!roomId || !startDate || !endDate || !guestInfo || !guestInfo.email || !guestInfo.name) {
            throw new ApiError(400, "Missing required reservation data.");
        }

        const newReservation = await createReservationService(
            roomId,
            new Date(startDate),
            new Date(endDate),
            guestInfo,
        );

        res.status(201).json({
            success: true,
            message: "Reservation created successfully",
            data: newReservation
        });
    } catch (error) {
        next(error);
    }
};

