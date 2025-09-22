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
exports.ReviewController = void 0;
const Review_service_1 = require("../services/Review.service");
const reviewService = new Review_service_1.ReviewService();
class ReviewController {
    // User membuat review
    createReview(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const { bookingId, rating, comment } = req.body;
                const review = yield reviewService.createReview(userId, bookingId, rating, comment);
                res.status(201).json({
                    success: true,
                    message: "Review berhasil dibuat",
                    data: review,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // Tenant membalas review
    replyReview(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { reviewId } = req.params;
                const { reply } = req.body;
                const review = yield reviewService.replyReview(reviewId, reply);
                res.status(200).json({
                    success: true,
                    message: "Reply berhasil dikirim",
                    data: review,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // Get review berdasarkan propertyId
    getReviewByProperty(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { propertyId } = req.params;
                const reviews = yield reviewService.getReviewsByProperty(propertyId);
                res.status(200).json({
                    success: true,
                    message: "Berhasil mendapatkan review berdasarkan propertyId",
                    data: reviews,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // Get review berdasarkan nama hotel
    getReviewByPropertyName(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { propertyName } = req.params;
                const reviews = yield reviewService.getReviewsByPropertyName(propertyName);
                res.status(200).json({
                    success: true,
                    message: `Berhasil mendapatkan review untuk hotel ${propertyName}`,
                    data: reviews,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getTenantReviews(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tenantId = req.user.tenant.id;
                const limit = req.query.limit ? parseInt(req.query.limit) : 3;
                const reviews = yield reviewService.getReviewsByTenant(tenantId, limit);
                res.status(200).json({
                    success: true,
                    message: "Berhasil mendapatkan ulasan untuk tenant",
                    data: { reviews },
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.ReviewController = ReviewController;
