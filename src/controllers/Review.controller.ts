import { Request, Response, NextFunction } from "express";
import { ReviewService } from "../services/Review.service";

const reviewService = new ReviewService();

export class ReviewController {
    public async createReview(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = (req.user as { id: number }).id;
            const { bookingId, rating, comment } = req.body;

            const review = await reviewService.createReview(
                userId,
                Number(bookingId),
                Number(rating),
                comment
            );

            res.status(201).json({
                success: true,
                message: "Review berhasil dibuat",
                data: review,
            });
        } catch (error) {
            next(error)
        }
    }

    public async replyReview(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { reviewId } = req.params;
            const { reply } = req.body;

            const review = await reviewService.replyReview(Number(reviewId), reply);
            res.status(200).json({
                success: true,
                message: "Reply berhasil dikirim",
                data: review
            })
        } catch (error) {
            next(error)
        }
    }

    public async getReviewByProperty(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { propertyId } = req.params;
            const review = await reviewService.getReviewsByProperty(Number(propertyId));

            res.status(200).json({
                success: true,
                message: "Berhasil mendapatkan review pada property",
                data: review
            })
        } catch (error) {
            next(error)
        }
    }
}
