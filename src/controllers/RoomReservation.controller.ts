import { Request, Response, NextFunction } from "express";
import { createReservationService, getReservationByIdService, getUserReservationsService, updateReservationStatusService } from "../services/RoomReservation.service";
import ApiError from "../utils/apiError";

// User dapat membuat reservasi baru
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

//  User dapat melihat semua reservasi mereka
export const getUserReservationsController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = (req.user as any).id;

        const myReservations = await getUserReservationsService(userId);

        res.status(200).json({
            success: true,
            message: "Successfully fetched my reservations",
            data: myReservations
        })

    } catch (error) {
        next(error)
    }
}

// User dapat melihat detail reservasi berdasarkan Id
export const getResevationByIdController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const reservation = await getReservationByIdService(Number(id));

        if (!reservation) {
            throw new ApiError(404, "Reservation not found");
        }

        res.status(200).json({
            success: true,
            message: "Successfully fetched reservation details",
            data: reservation
        })
    } catch (error) {
        next(error)
    }
}

// Tenant dapat mengubah status reservasi/pesanan
export const updateReservationStatusController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updateStatusTransaction = await updateReservationStatusService(Number(id), status);
        
        res.status(200).json({
            success: true,
            message: "Reservation status updated successfully",
            data: updateStatusTransaction
        })
    } catch (error) {
        next(error)
    }
}


