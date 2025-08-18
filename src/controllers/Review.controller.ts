import { Request, Response, NextFunction } from 'express';
import { submitReview, replyToReview } from '../services/Review.service';

export class ReviewController {
    public async submitReview(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { bookingId, propertyId, comment } = req.body;
            const user = req.user as any;

            const review = await submitReview(user.id, bookingId, propertyId, comment);

            res.status(200).json({
                success: true,
                message: "Review berhasil dikirim!",
                data: review
            })
        } catch (error) {
            next(error)
        }
    }

    public async replyToComment(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { reviewId } = req.params;
            const { replyComment } = req.body;
            const user = req.user as any;

            const updatedReview = await replyToReview(user.id, parseInt(reviewId), replyComment)

            res.status(200).json({
                success: true,
                message: "Balasan berhasil dikirim!",
                data: updatedReview
            })
        } catch (error) {
            next(error)
        }
    }
}