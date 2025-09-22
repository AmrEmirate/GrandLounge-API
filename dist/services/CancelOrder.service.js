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
exports.CancelOrderService = void 0;
const prisma_1 = require("../config/prisma");
const CancelOrder_repositroy_1 = __importDefault(require("../repositories/CancelOrder.repositroy"));
const apiError_1 = __importDefault(require("../utils/apiError"));
const cancelOrderRepo = new CancelOrder_repositroy_1.default();
const CancelOrderService = (invoiceNumber, userId, isTenant) => __awaiter(void 0, void 0, void 0, function* () {
    const booking = yield cancelOrderRepo.findBookingById(invoiceNumber);
    if (!booking) {
        throw new apiError_1.default(404, "Pesanan tidak di temukan");
    }
    let authorized = false;
    if (booking.userId === userId) {
        authorized = true;
    }
    if (isTenant) {
        // Cari tenantId yang terkait dengan userId
        const tenant = yield prisma_1.prisma.tenant.findUnique({
            where: { userId: userId },
            select: { id: true }
        });
        if (tenant && booking.property.tenantId === tenant.id) {
            authorized = true;
        }
    }
    if (!authorized) {
        throw new apiError_1.default(403, "Anda tidak memiliki izin untuk membatalkan pesanan ini.");
    }
    // Validasi status
    if (booking.status !== "MENUNGGU_PEMBAYARAN" && booking.status !== "MENUNGGU_KONFIRMASI") {
        throw new apiError_1.default(400, "Pesanan ini tidak dapat dibatalkan.");
    }
    const cancelOrder = yield cancelOrderRepo.updateBookingStatus(invoiceNumber, "DIBATALKAN");
    return cancelOrder;
});
exports.CancelOrderService = CancelOrderService;
