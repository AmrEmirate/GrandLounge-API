import { Request, Response, NextFunction } from "express";
import RoomReservationRepository from "../repositories/roomReservation.repository";
import ApiError from "../utils/apiError";
import RoomReservationService from "../services/roomReservation.service";

// Repository is imported as instance

class RoomReservationController {
  public async createReservationController(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { propertyId, roomName, checkIn, checkOut, guestInfo } = req.body;

      const newBooking = await RoomReservationService.createReservation(
        propertyId,
        roomName,
        new Date(checkIn),
        new Date(checkOut),
        guestInfo
      );

      res.status(201).json({
        success: true,
        message: "Reservasi berhasil dibuat.",
        data: newBooking,
      });
    } catch (error: any) {
      next(error);
    }
  }
  public async getUserReservationController(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = (req.user as any).id;
      const myReservations =
        await RoomReservationRepository.findTransactionByAccountId(userId);

      res.status(200).json({
        success: true,
        message: "Successfully fetched my reservations",
        data: myReservations,
      });
    } catch (error) {
      next(error);
    }
  }
  public async getReservationByRoomNameController(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { name } = req.params;

      if (!name) {
        throw new ApiError(400, "Data reservasi tidak lengkap.");
      }

      const userId = (req.user as any).id;

      const reservation = await RoomReservationService.getReservationByName(
        name,
        userId
      );

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
  public async updateReservationStatusController(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const updatedReservation =
        await RoomReservationRepository.updateTransaction(id, { status });

      res.status(200).json({
        success: true,
        message: "Reservation status updated successfully",
        data: updatedReservation,
      });
    } catch (error) {
      next(error);
    }
  }

  public async checkAvailableRoomsController(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { propertyId, checkIn, checkOut } = req.body;

      if (!propertyId || !checkIn || !checkOut) {
        throw new ApiError(400, "Missing required data");
      }

      const availableRooms = await RoomReservationRepository.getAvailableRooms(
        propertyId,
        new Date(checkIn),
        new Date(checkOut)
      );

      res.status(200).json({
        success: true,
        message: "Available rooms fetched successfully",
        data: availableRooms,
        availableCount: availableRooms.length,
      });
    } catch (error) {
      next(error);
    }
  }

  public async createReservationByRoomNameController(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        propertyId,
        roomName,
        checkIn,
        checkOut,
        guestInfo,
        paymentMethod,
      } = req.body;

      if (
        !propertyId ||
        !roomName ||
        !checkIn ||
        !checkOut ||
        !guestInfo?.email ||
        !guestInfo?.name ||
        !paymentMethod
      ) {
        throw new ApiError(400, "Data reservasi tidak lengkap.");
      }
      const newReservation = await RoomReservationService.createReservation(
        propertyId,
        roomName,
        new Date(checkIn),
        new Date(checkOut),
        guestInfo
      );
      res.status(201).json({
        success: true,
        message: "Reservasi berhasil dibuat.",
        data: newReservation,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new RoomReservationController();
