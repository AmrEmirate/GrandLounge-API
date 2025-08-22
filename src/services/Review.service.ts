import { prisma } from "../config/prisma";
import { ReviewRepository } from "../repositories/Review.repositori";
import ApiError from "../utils/apiError";

export class ReviewService {
    private reviewRepo = new ReviewRepository();

    async createReview(userId: number, bookingId: number, rating: number, comment?: string) {
        const booking = await prisma.booking.findUnique({ where: { id: bookingId } })

        if (!booking) {
            throw new ApiError(404, "Booking tidak di temukan")
        }

        if (booking.userId !== userId) {
            throw new ApiError(403, "Tidak Bisa Review Orang Lain")
        }

        if (booking.status !== "SELESAI") {
            throw new ApiError(400, "Review hanya bisa setelah check out")
        }

        const existing = await this.reviewRepo.findBookingById(bookingId);
        if (existing) {
            throw new ApiError(400, "Review sudah pernah di berikan")
        }

        return this.reviewRepo.createReview({
            userId,
            propertyId: booking.propertyId,
            bookingId,
            rating,
            comment,
        });
    }

    async replyReview(reviewId: number, reply: string) {
        return this.reviewRepo.replyReview(reviewId, reply)
    }

    async getReviewsByProperty(propertyId: number) {
        return this.reviewRepo.getReviewsByProperty(propertyId)
    }
}