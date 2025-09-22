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
exports.updateReservationStatusService = exports.getReservationByNameService = exports.getUserReservationsService = exports.createReservationService = void 0;
const client_1 = require("../../prisma/generated/client");
const RoomReservation_repositori_1 = __importDefault(require("../repositories/RoomReservation.repositori"));
const apiError_1 = __importDefault(require("../utils/apiError"));
const crypto_1 = __importDefault(require("crypto"));
const uuid_1 = require("uuid");
const prisma_1 = require("../config/prisma");
const reservationRepo = new RoomReservation_repositori_1.default();
const createReservationService = (propertyId, roomName, checkIn, checkOut, guestInfo) => __awaiter(void 0, void 0, void 0, function* () {
    if (checkOut <= checkIn) {
        throw new apiError_1.default(400, "End date must be after start date");
    }
    console.log("--- DEBUGGING RESERVASI ---");
    console.log("Mencari kamar dengan NAMA:", roomName);
    console.log("Di dalam PROPERTI ID:", propertyId);
    const room = yield reservationRepo.findRoomByName(propertyId, roomName);
    if (!room) {
        throw new apiError_1.default(404, `Kamar dengan nama "${roomName}" tidak ditemukan di properti ini.`);
    }
    const user = yield reservationRepo.findOrCreateAccount(guestInfo);
    const durationDays = Math.ceil((checkOut.getTime() - checkIn.getTime()) / 86400000);
    const totalPrice = room.basePrice * durationDays;
    const reservationId = (0, uuid_1.v4)();
    const invoiceNumber = `INV-${Date.now()}-${crypto_1.default.randomBytes(4).toString("hex")}`;
    const newBooking = yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const isAvailable = yield reservationRepo.checkRoomAvailability(room.id, checkIn, checkOut, tx);
        if (!isAvailable) {
            throw new apiError_1.default(400, "Kamar ini tidak tersedia pada tanggal yang dipilih.");
        }
        const booking = yield tx.booking.create({
            data: {
                invoiceNumber,
                reservationId,
                checkIn: checkIn,
                checkOut: checkOut,
                totalPrice,
                status: client_1.BookingStatus.MENUNGGU_PEMBAYARAN,
                paymentDeadline: new Date(Date.now() + 1 * 60 * 60 * 1000),
                user: { connect: { id: user.id } },
                property: { connect: { id: room.propertyId } },
            },
        });
        yield tx.bookingRoom.create({
            data: {
                bookingId: booking.id,
                roomId: room.id,
                guestCount: 1,
                pricePerNight: room.basePrice,
                numberOfNights: durationDays,
                totalPrice: totalPrice,
            },
        });
        return booking;
    }));
    return newBooking;
});
exports.createReservationService = createReservationService;
const getUserReservationsService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const reservation = yield reservationRepo.findTransactionByAccountId(userId);
    return reservation;
});
exports.getUserReservationsService = getUserReservationsService;
// dapat melihat detaol reservasi berdasarkan Nama
const getReservationByNameService = (roomName, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const reservation = yield reservationRepo.findTransactionByRoomName(roomName, userId);
    if (!reservation || reservation.userId !== userId) {
        throw new apiError_1.default(404, `Reservasi untuk kamar dengan nama "${roomName}" tidak ditemukan.`);
    }
    return reservation;
});
exports.getReservationByNameService = getReservationByNameService;
// tenant dapat mengubah status reservasi
const updateReservationStatusService = (bookingId, newStatus) => __awaiter(void 0, void 0, void 0, function* () {
    return reservationRepo.updateTransaction(bookingId, { status: newStatus });
});
exports.updateReservationStatusService = updateReservationStatusService;
