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
exports.getPendingConfirmationService = exports.completeOrderService = exports.getTenantTransactionsService = exports.OrderListService = void 0;
const prisma_1 = require("../config/prisma");
const OrderList_repositori_1 = __importDefault(require("../repositories/OrderList.repositori"));
const apiError_1 = __importDefault(require("../utils/apiError"));
const OrderListService = (userId, filter) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orderRepo = new OrderList_repositori_1.default();
        const orderList = yield orderRepo.findReservationByFilter(userId, filter);
        return orderList;
    }
    catch (error) {
        throw error;
    }
});
exports.OrderListService = OrderListService;
const getTenantTransactionsService = (tenantId, filter) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orderRepo = new OrderList_repositori_1.default();
        const transactions = yield orderRepo.findTransactionsByFilterForTenant(tenantId, filter);
        return transactions;
    }
    catch (error) {
        throw error;
    }
});
exports.getTenantTransactionsService = getTenantTransactionsService;
const completeOrderService = (userId, bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    const orderRepo = new OrderList_repositori_1.default();
    const booking = yield prisma_1.prisma.booking.findFirst({
        where: { id: bookingId, userId: userId },
    });
    if (!booking)
        throw new apiError_1.default(404, "Booking not found or you are not the owner.");
    if (booking.status !== "DIPROSES")
        throw new apiError_1.default(400, "Only in-process bookings can be completed.");
    const updatedBooking = yield orderRepo.updateBookingStatus(bookingId, "SELESAI");
    return updatedBooking;
});
exports.completeOrderService = completeOrderService;
const getPendingConfirmationService = (tenantId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orderRepo = new OrderList_repositori_1.default();
        const transactions = yield orderRepo.findPendingConfirmationForTenant(tenantId);
        return transactions;
    }
    catch (error) {
        throw error;
    }
});
exports.getPendingConfirmationService = getPendingConfirmationService;
