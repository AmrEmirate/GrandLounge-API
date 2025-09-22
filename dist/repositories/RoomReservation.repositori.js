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
const client_1 = require("../../prisma/generated/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../config/prisma");
const date_fns_1 = require("date-fns");
class RoomReservationRepository {
    checkRoomAvailability(roomId, newStartDate, newEndDate, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingBookings = yield tx.bookingRoom.count({
                where: {
                    roomId: roomId,
                    booking: {
                        status: { in: [client_1.BookingStatus.MENUNGGU_PEMBAYARAN, client_1.BookingStatus.DIPROSES] },
                        checkOut: { gt: newStartDate },
                        checkIn: { lt: newEndDate }
                    }
                }
            });
            if (existingBookings > 0) {
                return false;
            }
            const datesInRange = (0, date_fns_1.eachDayOfInterval)({ start: newStartDate, end: new Date(newEndDate.getTime() - 1) });
            const unavailableDatesCount = yield tx.roomAvailability.count({
                where: {
                    roomId: roomId,
                    date: { in: datesInRange },
                    isAvailable: false
                }
            });
            return unavailableDatesCount === 0;
        });
    }
    createTransaction(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.booking.create({ data });
        });
    }
    findRoomByName(propertyId, name) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma_1.prisma.room.findFirst({
                where: {
                    propertyId: propertyId,
                    name: name,
                },
                select: { id: true, propertyId: true, basePrice: true },
            });
        });
    }
    findOrCreateAccount(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const raw = (_a = userData.password) !== null && _a !== void 0 ? _a : crypto_1.default.randomBytes(8).toString("hex");
            const hashed = yield bcrypt_1.default.hash(raw, 10);
            return prisma_1.prisma.user.upsert({
                where: { email: userData.email },
                update: { fullName: userData.name },
                create: {
                    role: "USER",
                    fullName: userData.name,
                    email: userData.email,
                    password: hashed,
                },
            });
        });
    }
    findTransactionByAccountId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.booking.findMany({
                where: { userId: userId },
                include: {
                    property: true,
                    bookingRooms: { include: { room: true } },
                },
            });
        });
    }
    findTransactionByRoomName(roomName, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.booking.findFirst({
                where: {
                    userId,
                    bookingRooms: {
                        some: {
                            room: {
                                name: roomName,
                            },
                        },
                    },
                },
                include: {
                    property: {
                        include: {
                            city: true,
                            category: true,
                        },
                    },
                    bookingRooms: {
                        include: { room: true },
                    },
                },
            });
        });
    }
    updateTransaction(bookingId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.booking.update({
                where: { id: bookingId },
                data,
            });
        });
    }
    createReservationWithRooms(userId, propertyId, checkIn, checkOut, roomCount) {
        return __awaiter(this, void 0, void 0, function* () {
            const rooms = yield prisma_1.prisma.room.findMany({ where: { propertyId } });
            const availableRooms = [];
            for (const room of rooms) {
                const isAvailable = yield this.checkRoomAvailability(room.id, checkIn, checkOut, prisma_1.prisma);
                if (isAvailable) {
                    availableRooms.push({ id: room.id, basePrice: room.basePrice });
                }
                if (availableRooms.length >= roomCount)
                    break;
            }
            if (availableRooms.length < roomCount) {
                throw new Error("Tidak cukup kamar tersedia untuk tanggal yang dipilih");
            }
            const numberOfNights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
            let calculatedTotalPrice = 0;
            const bookingRoomsDataToCreate = availableRooms.map(room => {
                const totalPrice = numberOfNights * room.basePrice;
                calculatedTotalPrice += totalPrice;
                return {
                    roomId: room.id,
                    guestCount: 1, // Asumsi 1 tamu per kamar
                    pricePerNight: room.basePrice,
                    numberOfNights,
                    totalPrice: totalPrice,
                };
            });
            const transactionResult = yield prisma_1.prisma.$transaction((prisma) => __awaiter(this, void 0, void 0, function* () {
                const booking = yield prisma.booking.create({
                    data: {
                        userId,
                        propertyId,
                        checkIn,
                        checkOut,
                        totalPrice: calculatedTotalPrice,
                        status: client_1.BookingStatus.MENUNGGU_PEMBAYARAN,
                        invoiceNumber: `INV-${Date.now()}`,
                        paymentDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
                        bookingRooms: {
                            createMany: {
                                data: bookingRoomsDataToCreate,
                            },
                        },
                    },
                    include: { bookingRooms: true }, // Sertakan data yang baru dibuat
                });
                return booking;
            }));
            return prisma_1.prisma.booking.findMany({
                where: { id: transactionResult.id },
                include: { bookingRooms: { include: { room: true } }, property: true },
            });
        });
    }
    getAvailableRooms(propertyId, checkIn, checkOut) {
        return __awaiter(this, void 0, void 0, function* () {
            const rooms = yield prisma_1.prisma.room.findMany({ where: { propertyId } });
            const availableRooms = [];
            for (const room of rooms) {
                const isAvailable = yield this.checkRoomAvailability(room.id, checkIn, checkOut, prisma_1.prisma);
                if (isAvailable)
                    availableRooms.push(room.id);
            }
            return availableRooms;
        });
    }
}
exports.default = RoomReservationRepository;
