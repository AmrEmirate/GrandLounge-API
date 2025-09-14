import { Request, Response, NextFunction } from "express";
import RoomReservationRepository from "../repositories/RoomReservation.repositori";
import ApiError from "../utils/apiError";
import { createReservationService, getReservationByNameService } from "../services/RoomReservation.service";

const repo = new RoomReservationRepository();

class RoomReservationController {
    // USER CREATE RESERVATION
    public async createReservationController(req: Request, res: Response, next: NextFunction) {
        try {
            const { propertyId, roomName, checkIn, checkOut, guestInfo, paymentMethod } = req.body;

            // Validasi input
            if (!propertyId || !checkIn || !checkOut || !roomName || !guestInfo?.email || !guestInfo?.name || !paymentMethod) {
                throw new ApiError(400, "Missing required reservation data.");
            }

            // Buat account jika belum ada
            const user = await repo.findOrCreateAccount({ email: guestInfo.email, name: guestInfo.name });

            // Buat reservation + bookingRooms otomatis
            const newReservation = await createReservationService(
                propertyId, roomName, new Date(checkIn), new Date(checkOut), guestInfo
            );
            res.status(201).json({
                success: true,
                message: "Reservation created successfully",
                data: newReservation,
            });
        } catch (error: any) {
            next(error);
        }
    }

    // USER MELIHAT SEMUA RESERVASI MEREKA
    public async getUserReservationController(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as any).id;
            const myReservations = await repo.findTransactionByAccountId(userId);

            res.status(200).json({
                success: true,
                message: "Successfully fetched my reservations",
                data: myReservations,
            });
        } catch (error) {
            next(error);
        }
    }

    // USER MELIHAT DETAIL RESERVASI
    public async getReservationByRoomNameController(req: Request, res: Response, next: NextFunction) {
        try {
            const { name } = req.params;

            if (!name) {
                throw new ApiError(400, "Data reservasi tidak lengkap.");
            }

            const userId = (req.user as any).id;

            const reservation = await getReservationByNameService(name, userId);

            if (!reservation) {
                throw new ApiError(404, "Reservasi untuk kamar ini tidak ditemukan.");
            }

            res.status(200).json({
                success: true,
                message: "Successfully fetched reservation details",
                data: reservation,
            });
        } catch (error) {
            next(error);
        }
    }

    // TENANT UPDATE STATUS
    public async updateReservationStatusController(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const updatedReservation = await repo.updateTransaction(id, { status });

            res.status(200).json({
                success: true,
                message: "Reservation status updated successfully",
                data: updatedReservation,
            });
        } catch (error) {
            next(error);
        }
    }

    public async checkAvailableRoomsController(req: Request, res: Response, next: NextFunction) {
        try {
            const { propertyId, checkIn, checkOut } = req.body;

            if (!propertyId || !checkIn || !checkOut) {
                throw new ApiError(400, "Missing required data");
            }

            const availableRooms = await repo.getAvailableRooms(
                propertyId,
                new Date(checkIn),
                new Date(checkOut)
            );

            res.status(200).json({
                success: true,
                message: "Available rooms fetched successfully",
                data: availableRooms,
                availableCount: availableRooms.length
            });
        } catch (error) {
            next(error);
        }
    }

    public async createReservationByRoomNameController(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            // Pastikan 'paymentMethod' diambil dari req.body
            const { propertyId, roomName, checkIn, checkOut, guestInfo, paymentMethod } = req.body;

            if (!propertyId || !roomName || !checkIn || !checkOut || !guestInfo?.email || !guestInfo?.name || !paymentMethod) {
                throw new ApiError(400, "Data reservasi tidak lengkap.");
            }

            // Pastikan 'paymentMethod' diteruskan ke service
            const newReservation = await createReservationService(
                propertyId,
                roomName,
                new Date(checkIn),
                new Date(checkOut),
                guestInfo,
            );
            console.log("Request body:", req.body);
            res.status(201).json({
                success: true,
                message: "Reservasi berhasil dibuat.",
                data: newReservation,
            });
        } catch (error) {
            next(error)
        }
    }

}

export default RoomReservationController;
