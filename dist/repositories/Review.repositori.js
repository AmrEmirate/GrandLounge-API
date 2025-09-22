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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewRepository = void 0;
const prisma_1 = require("../config/prisma");
class ReviewRepository {
    createReview(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, propertyId, bookingId, rating, comment, }) {
            return prisma_1.prisma.review.create({
                data: {
                    userId,
                    propertyId,
                    bookingId,
                    rating,
                    comment: comment !== null && comment !== void 0 ? comment : null,
                },
            });
        });
    }
    findBookingBy(bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.review.findFirst({
                where: { bookingId }
            });
        });
    }
    replyReview(reviewId, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.review.update({
                where: { id: reviewId },
                data: { reply },
                include: {
                    user: {
                        select: {
                            fullName: true,
                            profilePicture: true,
                        },
                    },
                    property: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });
        });
    }
    getReviewsByPropertyName(propertyName) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.review.findMany({
                where: {
                    property: {
                        name: propertyName,
                    },
                },
                include: { user: true, property: true },
            });
        });
    }
    findReviewsByTenant(tenantId, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.review.findMany({
                where: {
                    property: {
                        tenantId: tenantId,
                    },
                },
                include: {
                    user: { select: { fullName: true, profilePicture: true } },
                    property: { select: { id: true, name: true } },
                },
                orderBy: {
                    createdAt: 'desc',
                },
                take: limit,
            });
        });
    }
}
exports.ReviewRepository = ReviewRepository;
