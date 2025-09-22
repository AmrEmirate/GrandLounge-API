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
exports.ReviewService = void 0;
const Review_repositori_1 = require("../repositories/Review.repositori");
const prisma_1 = require("../config/prisma");
const apiError_1 = __importDefault(require("../utils/apiError"));
class ReviewService {
    constructor() {
        this.reviewRepo = new Review_repositori_1.ReviewRepository();
    }
    createReview(userId, bookingId, rating, comment) {
        return __awaiter(this, void 0, void 0, function* () {
            const booking = yield prisma_1.prisma.booking.findUnique({ where: { id: bookingId } });
            if (!booking)
                throw new apiError_1.default(404, "Booking tidak ditemukan");
            if (booking.userId !== userId)
                throw new apiError_1.default(403, "Tidak bisa review booking orang lain");
            if (booking.status !== "SELESAI")
                throw new apiError_1.default(400, "Review hanya bisa setelah check-out");
            const currentDate = new Date();
            const checkoutDate = new Date(booking.checkOut);
            currentDate.setHours(0, 0, 0, 0);
            checkoutDate.setHours(0, 0, 0, 0);
            if (currentDate <= checkoutDate) {
                throw new apiError_1.default(400, 'You can only review this booking after the check-out date has passed.');
            }
            const existing = yield this.reviewRepo.findBookingBy(bookingId);
            if (existing)
                throw new apiError_1.default(400, "Review sudah pernah diberikan");
            return this.reviewRepo.createReview({
                userId,
                propertyId: booking.propertyId,
                bookingId,
                rating,
                comment,
            });
        });
    }
    replyReview(reviewId, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.reviewRepo.replyReview(reviewId, reply);
            }
            catch (error) {
                if (error instanceof Error) {
                    // P2025 adalah kode error Prisma untuk 'record not found'
                    throw new apiError_1.default(404, "Review tidak ditemukan.");
                }
                throw error; // Lempar error lain
            }
        });
    }
    getReviewsByProperty(propertyId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getReviewsByPropertyId(propertyId);
        });
    }
    getReviewsByPropertyName(propertyName) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.reviewRepo.getReviewsByPropertyName(propertyName);
        });
    }
    getReviewsByPropertyId(propertyId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.review.findMany({
                where: { propertyId },
                include: { user: true, property: true },
            });
        });
    }
    getReviewsByTenant(tenantId, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.reviewRepo.findReviewsByTenant(tenantId, limit);
        });
    }
}
exports.ReviewService = ReviewService;
