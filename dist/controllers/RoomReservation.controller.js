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
const RoomReservation_repositori_1 = __importDefault(require("../repositories/RoomReservation.repositori"));
const apiError_1 = __importDefault(require("../utils/apiError"));
const RoomReservation_service_1 = require("../services/RoomReservation.service");
const repo = new RoomReservation_repositori_1.default();
class RoomReservationController {
    // USER CREATE RESERVATION
    createReservationController(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { propertyId, roomName, checkIn, checkOut, guestInfo } = req.body;
                const newBooking = yield (0, RoomReservation_service_1.createReservationService)(propertyId, roomName, new Date(checkIn), new Date(checkOut), guestInfo);
                res.status(201).json({
                    success: true,
                    message: "Reservasi berhasil dibuat.",
                    data: newBooking,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // USER MELIHAT SEMUA RESERVASI MEREKA
    getUserReservationController(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const myReservations = yield repo.findTransactionByAccountId(userId);
                res.status(200).json({
                    success: true,
                    message: "Successfully fetched my reservations",
                    data: myReservations,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // USER MELIHAT DETAIL RESERVASI
    getReservationByRoomNameController(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name } = req.params;
                if (!name) {
                    throw new apiError_1.default(400, "Data reservasi tidak lengkap.");
                }
                const userId = req.user.id;
                const reservation = yield (0, RoomReservation_service_1.getReservationByNameService)(name, userId);
                if (!reservation) {
                    throw new apiError_1.default(404, "Reservasi untuk kamar ini tidak ditemukan.");
                }
                res.status(200).json({
                    success: true,
                    message: "Successfully fetched reservation details",
                    data: reservation,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // TENANT UPDATE STATUS
    updateReservationStatusController(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { status } = req.body;
                const updatedReservation = yield repo.updateTransaction(id, { status });
                res.status(200).json({
                    success: true,
                    message: "Reservation status updated successfully",
                    data: updatedReservation,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    checkAvailableRoomsController(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { propertyId, checkIn, checkOut } = req.body;
                if (!propertyId || !checkIn || !checkOut) {
                    throw new apiError_1.default(400, "Missing required data");
                }
                const availableRooms = yield repo.getAvailableRooms(propertyId, new Date(checkIn), new Date(checkOut));
                res.status(200).json({
                    success: true,
                    message: "Available rooms fetched successfully",
                    data: availableRooms,
                    availableCount: availableRooms.length
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    createReservationByRoomNameController(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Pastikan 'paymentMethod' diambil dari req.body
                const { propertyId, roomName, checkIn, checkOut, guestInfo, paymentMethod } = req.body;
                if (!propertyId || !roomName || !checkIn || !checkOut || !(guestInfo === null || guestInfo === void 0 ? void 0 : guestInfo.email) || !(guestInfo === null || guestInfo === void 0 ? void 0 : guestInfo.name) || !paymentMethod) {
                    throw new apiError_1.default(400, "Data reservasi tidak lengkap.");
                }
                // Pastikan 'paymentMethod' diteruskan ke service
                const newReservation = yield (0, RoomReservation_service_1.createReservationService)(propertyId, roomName, new Date(checkIn), new Date(checkOut), guestInfo);
                console.log("Request body:", req.body);
                res.status(201).json({
                    success: true,
                    message: "Reservasi berhasil dibuat.",
                    data: newReservation,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = RoomReservationController;
