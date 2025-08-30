// src/controllers/Review.controller.ts
import { Request, Response, NextFunction } from "express";
import { ReviewService } from "../services/Review.service";

const reviewService = new ReviewService();

export class ReviewController {
    // User membuat review
    public async createReview(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as { id: string }).id;
            const { bookingId, rating, comment } = req.body;
            const review = await reviewService.createReview(userId, bookingId, rating, comment);

            res.status(201).json({
                success: true,
                message: "Review berhasil dibuat",
                data: review,
            });
        } catch (error) {
            next(error);
        }
    }

    // Tenant membalas review
    public async replyReview(req: Request, res: Response, next: NextFunction) {
        try {
            const { reviewId } = req.params;
            const { reply } = req.body;
            const review = await reviewService.replyReview(reviewId, reply);

            res.status(200).json({
                success: true,
                message: "Reply berhasil dikirim",
                data: review,
            });
        } catch (error) {
            next(error);
        }
    }

    // Get review berdasarkan propertyId
    public async getReviewByProperty(req: Request, res: Response, next: NextFunction) {
        try {
            const { propertyId } = req.params;
            const reviews = await reviewService.getReviewsByProperty(propertyId);

            res.status(200).json({
                success: true,
                message: "Berhasil mendapatkan review berdasarkan propertyId",
                data: reviews,
            });
        } catch (error) {
            next(error);
        }
    }

    // Get review berdasarkan nama hotel
    public async getReviewByPropertyName(req: Request, res: Response, next: NextFunction) {
        try {
            const { propertyName } = req.params;
            const reviews = await reviewService.getReviewsByPropertyName(propertyName);

            res.status(200).json({
                success: true,
                message: `Berhasil mendapatkan review untuk hotel ${propertyName}`,
                data: reviews,
            });
        } catch (error) {
            next(error);
        }
    }

}
